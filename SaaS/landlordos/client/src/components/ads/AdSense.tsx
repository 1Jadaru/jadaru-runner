import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AdSenseProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const AdSense: React.FC<AdSenseProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  style = {},
  className = '',
}) => {
  const { user } = useAuth();

  // Disable ads in development mode to avoid console errors
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    try {
      // Only load AdSense for free tier users or guests, and not in development
      if (!isDevelopment && (user?.tier === 'FREE' || !user)) {
        // Check if AdSense script is already loaded
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [user, isDevelopment]);

  // Don't show ads for paid users (BASIC or PREMIUM) or in development
  if ((user && user.tier !== 'FREE') || isDevelopment) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style,
        }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense client ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};

// Sidebar Ad Component
export const SidebarAd: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.tier !== 'FREE') return null;

  return (
    <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
      <div className="text-xs text-gray-400 mb-2 text-center">Advertisement</div>
      <AdSense
        slot="1234567890"
        style={{ width: '100%', height: '250px' }}
        className="w-full"
      />
    </div>
  );
};

// Banner Ad Component
export const BannerAd: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.tier !== 'FREE') return null;

  return (
    <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
      <div className="text-xs text-gray-400 mb-2 text-center">Advertisement</div>
      <AdSense
        slot="0987654321"
        style={{ width: '100%', height: '90px' }}
        format="horizontal"
        className="w-full"
      />
    </div>
  );
};

// Upgrade Prompt for Free Users
export const UpgradePrompt: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.tier !== 'FREE') return null;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Upgrade to Remove Ads</h3>
        <p className="text-blue-200 text-sm mb-4">
          Get an ad-free experience, more properties, and premium features starting at $19/month.
        </p>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

// Mock Ad Component for Development/Demo
export const MockAd: React.FC<{ type?: 'sidebar' | 'banner' }> = ({ type = 'sidebar' }) => {
  const { user } = useAuth();
  const isDevelopment = import.meta.env.DEV;
  
  // In development mode, show a simple placeholder instead of trying to load AdSense
  if (user?.tier !== 'FREE') return null;

  const height = type === 'sidebar' ? 'h-64' : 'h-24';
  
  return (
    <div className={`mb-6 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-600/30 ${height} flex items-center justify-center`}>
      <div className="text-center">
        <div className="text-xs text-gray-400 mb-2">Advertisement</div>
        <div className="text-gray-500 text-sm">
          {isDevelopment ? 'Dev Mode - Ad Placeholder' : 'AdSense Ad Placeholder'}
          <br />
          ({type} format)
        </div>
      </div>
    </div>
  );
};

export default AdSense;

// Declare window.adsbygoogle for TypeScript
declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}
