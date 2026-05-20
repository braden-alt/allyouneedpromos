/**
 * Supplier API configuration — All You Need Promos probe tool.
 */
export const SUPPLIERS = {
  sanmar: {
    name: 'SanMar',
    promostandards: {
      uat: {
        base: 'https://uat-ws.sanmar.com:8080/promostandards',
        credentials: 'hardcoded test creds (WEBSERVICES-TEST / sanmar1)',
        endpoints: ['ProductDataServiceBinding','InventoryServiceBinding','MediaContentServiceBinding'],
      },
      production: {
        base: 'https://ws.sanmar.com:8080/promostandards',
        credentials: 'SANMAR_API_USER / SANMAR_API_PASS env vars',
        endpoints: ['ProductDataServiceBinding','InventoryServiceBinding','MediaContentServiceBinding','PricingAndConfigurationServiceBinding'],
      },
    },
    sftp: { host: 'ftp.sanmar.com', port: 2200, credEnvVars: 'SANMAR_SFTP_USER / SANMAR_SFTP_PASS', directory: '/SanmarPDD' },
    customerNumber: 'SANMAR_CUSTOMER_NUMBER env var',
  },
  hpg: { name: 'HPG', promostandards: { production: { base: 'https://promostandards.hpg.com', endpoints: ['ProductDataServiceBinding','InventoryServiceBinding','MediaContentServiceBinding','PricingAndConfigurationServiceBinding'] } } },
  logomark: { name: 'Logomark', promostandards: { production: { base: 'https://promostandards.logomark.com', endpoints: ['ProductDataServiceBinding','InventoryServiceBinding','MediaContentServiceBinding'] } } },
  gemline: { name: 'Gemline', promostandards: { production: { base: 'https://promostandards.gemline.com', endpoints: ['ProductDataServiceBinding','InventoryServiceBinding','MediaContentServiceBinding'] } } },
};
export default SUPPLIERS;
