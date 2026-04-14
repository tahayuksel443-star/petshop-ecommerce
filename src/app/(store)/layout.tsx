import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { getSiteSettings } from '@/lib/siteSettings';

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-petshop-warm">
      <Navbar
        siteName={settings.siteName}
        siteDescription={settings.siteDescription}
        announcementText={settings.announcementText}
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
      />
      <main className="flex-1">{children}</main>
      <Footer
        siteName={settings.siteName}
        footerDescription={settings.footerDescription}
        contactPhone={settings.contactPhone}
        contactEmail={settings.contactEmail}
        contactAddress={settings.contactAddress}
        instagram={settings.instagram}
        facebook={settings.facebook}
        twitter={settings.twitter}
        youtube={settings.youtube}
      />
    </div>
  );
}
