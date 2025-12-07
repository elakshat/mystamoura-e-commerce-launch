import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings, useUpdateSetting } from '@/hooks/useSettings';
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
  });

  const [shipping, setShipping] = useState({
    base_price: 0,
    free_threshold: 0,
  });

  const [tax, setTax] = useState({
    rate: 0,
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
        setFooter(settings.footer);
      }
      if (settings.shipping) {
        setShipping(settings.shipping);
      }
      if ((settings as any).tax) {
        setTax((settings as any).tax);
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
          <h1 className="font-display text-3xl font-semibold">Settings</h1>
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
              <TabsTrigger value="homepage">Homepage</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Tax</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-4">
                    Announcement Bar
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Announcement Bar</Label>
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
                      <Label htmlFor="announcement-text">Announcement Text</Label>
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
                  <h3 className="font-display text-lg font-semibold mb-4">
                    Footer Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="footer-about">About Text</Label>
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
                        <Label htmlFor="instagram">Instagram URL</Label>
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
                        <Label htmlFor="facebook">Facebook URL</Label>
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
                        <Label htmlFor="twitter">Twitter URL</Label>
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

            {/* Homepage Settings */}
            <TabsContent value="homepage" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-4">
                    Hero Section
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-title">Hero Title</Label>
                      <Input
                        id="hero-title"
                        value={hero.title}
                        onChange={(e) => setHero({ ...hero, title: e.target.value })}
                        placeholder="Discover Your Signature Scent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
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
                        <Label htmlFor="cta-text">CTA Button Text</Label>
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
                        <Label htmlFor="cta-link">CTA Button Link</Label>
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

            {/* Shipping & Tax Settings */}
            <TabsContent value="shipping" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-4">
                    Shipping Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="base-shipping">Base Shipping Price (₹)</Label>
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
                        <Label htmlFor="free-threshold">
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
                  <h3 className="font-display text-lg font-semibold mb-4">
                    Tax Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2 max-w-xs">
                      <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        step="0.01"
                        value={tax.rate}
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
          </Tabs>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
