import { Section } from 'astro-boilerplate-components';

import { AppConfig } from '@/utils/AppConfig';

const Footer = () => (
  <Section>
    <div className="border-t border-gray-600 pt-5">
      <div className="text-sm text-gray-500">
        All rights reserved © {AppConfig.author} {new Date().getFullYear()}
      </div>
    </div>
  </Section>
);

export { Footer };
