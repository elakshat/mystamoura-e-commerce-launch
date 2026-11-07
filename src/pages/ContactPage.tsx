import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { PageHero } from '@/components/brand/PageHero';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export default function ContactPage() {
  const { data: settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      contactSchema.parse(formData);
      
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const fields: { name: keyof typeof formData; label: string; type?: string }[] = [
    { name: 'name', label: 'Your Name' },
    { name: 'email', label: 'Email Address', type: 'email' },
  ];

  return (
    <MainLayout>
      <SEOHead
        title="Contact Us"
        description="Get in touch with Mystamoura. We'd love to hear from you about our luxury fragrances."
      />

      <PageHero
        eyebrow="Get in touch"
        title={<>Write to <em className="font-light">the house</em></>}
        description="Have a question or feedback? We'd love to hear from you."
      />

      <div className="container mx-auto grid gap-16 px-5 py-16 md:px-12 md:py-24 lg:grid-cols-12 lg:gap-12">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7"
        >
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="grid gap-7 md:grid-cols-2">
              {fields.map((f) => (
                <div key={f.name}>
                  <Label htmlFor={f.name}>{f.label}</Label>
                  <Input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    value={formData[f.name]}
                    onChange={handleChange}
                    className={errors[f.name] ? 'border-destructive' : ''}
                  />
                  {errors[f.name] && <p className="mt-1.5 text-xs text-destructive">{errors[f.name]}</p>}
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? 'border-destructive' : ''}
              />
              {errors.subject && <p className="mt-1.5 text-xs text-destructive">{errors.subject}</p>}
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className={`rounded-none bg-card/60 ${errors.message ? 'border-destructive' : ''}`}
              />
              {errors.message && <p className="mt-1.5 text-xs text-destructive">{errors.message}</p>}
            </div>

            <button type="submit" className="btn-maison w-full md:w-auto" disabled={loading}>
              {loading ? 'Sending…' : 'Send message'} <ArrowRight />
            </button>
          </form>
        </motion.div>

        {/* Contact Info */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4 lg:col-start-9"
        >
          <div className="on-nuit grain p-8 md:p-10">
            <div className="relative z-[2] space-y-8">
              {settings?.footer?.email && (
                <div>
                  <p className="eyebrow mb-2 text-[10px] text-brass-light">Email</p>
                  <a href={`mailto:${settings.footer.email}`} className="font-display text-2xl hover:text-brass-light break-all">
                    {settings.footer.email}
                  </a>
                </div>
              )}
              {settings?.footer?.phone && (
                <div>
                  <p className="eyebrow mb-2 text-[10px] text-brass-light">Phone</p>
                  <a href={`tel:${settings.footer.phone}`} className="font-display text-2xl hover:text-brass-light">
                    {settings.footer.phone}
                  </a>
                </div>
              )}
              <div>
                <p className="eyebrow mb-2 text-[10px] text-brass-light">Address</p>
                <p className="font-display text-2xl">{(settings?.footer as Record<string, string> | undefined)?.location || 'Mumbai, Maharashtra, India'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="label-caps mb-4 text-[11px]">Business Hours</h3>
            <dl className="divide-y border-y text-sm">
              {[
                ['Monday - Friday', '10:00 AM - 7:00 PM'],
                ['Saturday', '10:00 AM - 5:00 PM'],
                ['Sunday', 'Closed'],
              ].map(([day, hours]) => (
                <div key={day} className="flex justify-between py-3">
                  <dt className="text-muted-foreground">{day}</dt>
                  <dd>{hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.aside>
      </div>
    </MainLayout>
  );
}
