import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

export default function CookiesPolicy() {
  useEffect(() => {
    document.title = "Cookies Policy | Olive Seeds Design Studio";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col font-['DM_Sans'] text-[#181A18]">
      <SEO 
        title="Cookies Policy | Olive Seeds Design Studio" 
        description="Learn how Olive Seeds Design Studio uses cookies to enhance your browsing experience and provide personalized services." 
      />
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <header className="mb-12">
          <span className="text-[#A48855] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
            Legal & Privacy
          </span>
          <h1 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl lg:text-6xl text-[#181A18] mb-6">
            Cookies Policy
          </h1>
          <p className="text-[#676A65] text-sm">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </header>

        <article className="prose prose-sm sm:prose-base prose-slate max-w-none prose-headings:font-['Cormorant_Garamond'] prose-headings:text-[#181A18] prose-a:text-[#A48855]">
          <div className="space-y-8 text-[#4A4D4A] leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#181A18]">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide information to the owners of the site. They help us remember your preferences, keep your session secure, and understand how you interact with our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#181A18]">2. How We Use Cookies</h2>
              <p>
                At Olive Seeds Design Studio, we use a minimal set of cookies to ensure our website functions correctly and provides you with the best possible experience. We use cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li><strong>Essential Cookies:</strong> These are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.</li>
                <li><strong>Performance & Analytics:</strong> These cookies collect information that is used either in aggregate form to help us understand how our website is being used, or how effective our marketing campaigns are, so we can customize and improve our platform.</li>
                <li><strong>Functionality:</strong> These cookies allow our website to remember choices you make (such as your preferred currency or region) and provide enhanced, more personal features.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#181A18]">3. Managing Your Preferences</h2>
              <p>
                You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, but your access to some functionality and areas of our website may be restricted. 
              </p>
              <p className="mt-4">
                Because the means by which you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser's help menu for more information on managing your privacy settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#181A18]">4. Contact Us</h2>
              <p>
                If you have any questions about our use of cookies or other technologies, please email us at <strong>hello@oliveseedsdesignstudio.com</strong>.
              </p>
            </section>

          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}