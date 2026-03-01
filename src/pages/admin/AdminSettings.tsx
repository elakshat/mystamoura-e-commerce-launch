import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, CreditCard, ExternalLink, AlertCircle, CheckCircle2, Mail, Phone, MapPin } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSettings, useUpdateSetting } from '@/hooks/useSettings';
import { CollectionImageManager } from '@/components/admin/CollectionImageManager';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSetting();

  const [announcement, setAnnouncement] = useState({
    enabled: false,
    text: '',
  });

  const [hero, setHero] = useState({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
  });

  const [footer, setFooter] = useState({
    about_text: '',
    instagram: '',
    facebook: '',
    twitter: '',
    email: '',
    phone: '',
    location: '',
  });

  const [shipping, setShipping] = useState({
    base_price: 0,
    free_threshold: 0,
  });

  const [tax, setTax] = useState({
    rate: 18,
  });

  const [razorpay, setRazorpay] = useState({
    key_id: '',
    key_secret: '',
    test_mode: true,
    enabled: true,
  });

  useEffect(() => {
    if (settings) {
      if (settings.announcement) {
        setAnnouncement(settings.announcement);
      }
      if (settings.hero) {
        setHero(settings.hero);
      }
      if (settings.footer) {
        const footerSettings = settings.footer as Record<string, string>;
        setFooter({
          about_text: footerSettings.about_text || '',
          instagram: footerSettings.instagram || '',
          facebook: footerSettings.facebook || '',
          twitter: footerSettings.twitter || '',
          email: footerSettings.email || '',
          phone: footerSettings.phone || '',
          location: footerSettings.location || '',
        });
      }
      if (settings.shipping) {
        setShipping(settings.shipping);
      }
      if ((settings as any).tax) {
        setTax((settings as any).tax);
      }
      if ((settings as any).razorpay) {
        setRazorpay((settings as any).razorpay);
      }
    }
  }, [settings]);

  const handleSave = async (key: string, value: any) => {
    try {
      await updateSettings.mutateAsync({ key, value });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your store settings and preferences
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="homepage">Homepage</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Tax</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-4 text-foreground">
                    Announcement Bar
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-foreground">Enable Announcement Bar</Label>
                        <p className="text-sm text-muted-foreground">
                          Show a banner at the top of your store
                        </p>
                      </div>
                      <Switch
                        checked={announcement.enabled}
                        onCheckedChange={(enabled) =>
                          setAnnouncement({ ...announcement, enabled })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="announcement-text" className="text-foreground">Announcement Text</Label>
                      <Input
                        id="announcement-text"
                        value={announcement.text}
                        onChange={(e) =>
                          setAnnouncement({ ...announcement, text: e.target.value })
                        }
                        placeholder="Free shipping on orders over ₹999!"
                      />
                    </div>
                    <Button
                      onClick={() => handleSave('announcement', announcement)}
                      disabled={updateSettings.isPending}
                    >
                      {updateSettings.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Announcement
                    </Button>
                  </div>
                </div>

                <hr className="border-border" />

                <div>
                  <h3 className="font-display text-lg font-semibold mb-4 text-foreground">
                    Footer Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="footer-about" className="text-foreground">About Text</Label>
                      <Textarea
                        id="footer-about"
                        value={footer.about_text}
                        onChange={(e) =>
                          setFooter({ ...footer, about_text: e.target.value })
                        }
                        placeholder="Luxury fragrances crafted for the discerning..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-foreground">Instagram URL</Label>
                        <Input
                          id="instagram"
                          value={footer.instagram}
                          onChange={(e) =>
                            setFooter({ ...footer, instagram: e.target.value })
                          }
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook" className="text-foreground">Facebook URL</Label>
                        <Input
                          id="facebook"
                          value={footer.facebook}
                          onChange={(e) =>
                            setFooter({ ...footer, facebook: e.target.value })
                          }
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="text-foreground">Twitter URL</Label>
                        <Input
                          id="twitter"
                          value={footer.twitter}
                          onChange={(e) =>
                            setFooter({ ...footer, twitter: e.target.value })
                          }
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSave('footer', footer)}
                      disabled={updateSettings.isPending}
                    >
                      {updateSettings.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Footer Settings
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Contact Settings */}
            <TabsContent value="contact" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        Contact Information
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage contact details shown in the footer
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-email" className="text-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          Email Address
                        </Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={footer.email}
                          onChange={(e) =>
                            setFooter({ ...footer, email: e.target.value })
                          }
                          placeholder="hello@mystamoura.in"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone" className="text-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          Phone Number
                        </Label>
                        <Input
                          id="contact-phone"
                          type="tel"
                          value={footer.phone}
                          onChange={(e) =>
                            setFooter({ ...footer, phone: e.target.value })
                          }
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-location" className="text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Location / Address
                      </Label>
                      <Input
                        id="contact-location"
                        value={footer.location}
                        onChange={(e) =>
                          setFooter({ ...footer, location: e.target.value })
                        }
                        placeholder="Mumbai, India"
                      />
                    </div>
                    <Button
                      onClick={() => handleSave('footer', footer)}
                      disabled={updateSettings.isPending}
                    >
                      {updateSettings.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Contact Settings
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Homepage Settings */}
            <TabsContent value="homepage" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-4 text-foreground">
                    Hero Section
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-title" className="text-foreground">Hero Title</Label>
                      <Input
                        id="hero-title"
                        value={hero.title}
                        onChange={(e) => setHero({ ...hero, title: e.target.value })}
                        placeholder="Discover Your Signature Scent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-subtitle" className="text-foreground">Hero Subtitle</Label>
                      <Textarea
                        id="hero-subtitle"
                        value={hero.subtitle}
                        onChange={(e) =>
                          setHero({ ...hero, subtitle: e.target.value })
                        }
                        placeholder="Handcrafted perfumes that capture the essence of elegance..."
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cta-text" className="text-foreground">CTA Button Text</Label>
                        <Input
                          id="cta-text"
                          value={hero.cta_text}
                          onChange={(e) =>
                            setHero({ ...hero, cta_text: e.target.value })
                          }
                          placeholder="Shop Now"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cta-link" className="text-foreground">CTA Button Link</Label>
                        <Input
                          id="cta-link"
                          value={hero.cta_link}
                          onChange={(e) =>
                            setHero({ ...hero, cta_link: e.target.value })
                          }
                          placeholder="/products"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSave('hero', hero)}
                      disabled={updateSettings.isPending}
                    >
                      {updateSettings.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Hero Settings
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Collections Settings */}
            <TabsContent value="collections" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <CollectionImageManager />
              </div>
            </TabsContent>

            {/* Shipping & Tax Settings */}
            <TabsContent value="shipping" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-4 text-foreground">
                    Shipping Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="base-shipping" className="text-foreground">Base Shipping Price (₹)</Label>
                        <Input
                          id="base-shipping"
                          type="number"
                          value={shipping.base_price}
                          onChange={(e) =>
                            setShipping({
                              ...shipping,
                              base_price: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="free-threshold" className="text-foreground">
                          Free Shipping Threshold (₹)
                        </Label>
                        <Input
                          id="free-threshold"
                          type="number"
                          value={shipping.free_threshold}
                          onChange={(e) =>
                            setShipping({
                              ...shipping,
                              free_threshold: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Set to 0 for no free shipping
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSave('shipping', shipping)}
                      disabled={updateSettings.isPending}
                    >
                      {updateSettings.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Shipping Settings
                    </Button>
                  </div>
                </div>

                <hr className="border-border" />

                <div>
                  <h3 className="font-display text-lg font-semibold mb-4 text-foreground">
                    Tax Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2 max-w-xs">
                      <Label htmlFor="tax-rate" className="text-foreground">Tax Rate (%)</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={tax.rate ?? 18}
                        onChange={(e) =>
                          setTax({ rate: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <Button
                      onClick={() => handleSave('tax', tax)}
                      disabled={updateSettings.isPending}
                    >
                      {updateSettings.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Tax Settings
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payments" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        Razorpay Settings
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Configure your Razorpay payment gateway
                      </p>
                    </div>
                  </div>

                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>How to get Razorpay API Keys</AlertTitle>
                    <AlertDescription className="mt-2">
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Go to <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Razorpay Dashboard <ExternalLink className="h-3 w-3" /></a></li>
                        <li>Navigate to Settings → API Keys</li>
                        <li>Generate your Key ID and Key Secret</li>
                        <li>Use Test keys for testing, Live keys for production</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                    <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                       <div>
                         <Label className="text-foreground">Enable Razorpay</Label>
                         <p className="text-sm text-muted-foreground">
                           Accept online payments via Razorpay
                         </p>
                       </div>
                       <Switch
                         checked={razorpay.enabled}
                         onCheckedChange={(enabled) =>
                           setRazorpay({ ...razorpay, enabled })
                         }
                       />
                     </div>

                     <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                       <div>
                         <Label className="text-foreground">Test Mode</Label>
                         <p className="text-sm text-muted-foreground">
                           {razorpay.test_mode 
                             ? 'Using test credentials (no real payments)' 
                             : 'Using live credentials (real payments)'
                           }
                         </p>
                       </div>
                       <div className="flex items-center gap-3">
                         {razorpay.test_mode ? (
                           <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full">
                             Test Mode
                           </span>
                         ) : (
                           <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full flex items-center gap-1">
                             <CheckCircle2 className="h-3 w-3" /> Live
                           </span>
                         )}
                         <Switch
                           checked={razorpay.test_mode}
                           onCheckedChange={(test_mode) =>
                             setRazorpay({ ...razorpay, test_mode })
                           }
                         />
                       </div>
                     </div>

                     <Alert className="bg-primary/5 border-primary/20">
                       <AlertCircle className="h-4 w-4" />
                       <AlertTitle>Razorpay API Keys</AlertTitle>
                       <AlertDescription className="mt-2 text-sm">
                         Razorpay Key ID and Key Secret are managed as secure backend secrets and cannot be changed from this panel.
                         The toggles above (Enable / Test Mode) are saved here and control the checkout flow.
                         To update the actual API keys, contact your developer to update the backend secrets.
                       </AlertDescription>
                     </Alert>

                     <Button
                       onClick={() => handleSave('razorpay', { enabled: razorpay.enabled, test_mode: razorpay.test_mode })}
                       disabled={updateSettings.isPending}
                       className="w-full sm:w-auto"
                     >
                       {updateSettings.isPending ? (
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       ) : (
                         <Save className="h-4 w-4 mr-2" />
                       )}
                       Save Payment Settings
                     </Button>
                   </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
