// app/lib/suppliers.config.js
// Central supplier configuration for PromoStandards probe tool

export const SUPPLIERS = {
  hpg: {
    id: 'hpg',
    displayName: 'HPG Brands',
    auth: {
      idEnvVar: 'HPG_LOGIN_ID',
      passwordEnvVar: 'HPG_PASSWORD',
    },
    endpoints: [
      {
        name: 'productData',
        label: 'Product Data v2.0.0',
        urlTemplate: 'https://svc2.hpgbrands.com/{brandPath}/PRODUCT/2.0.0',
        version: 'v2',
        soapAction: 'getProduct',
      },
      {
        name: 'pricing',
        label: 'Pricing & Configuration v1.0.0',
        urlTemplate: 'https://svc2.hpgbrands.com/{brandPath}/PPC/1.0.0',
        version: 'v1',
        soapAction: 'getConfigurationAndPricing',
      },
      {
        name: 'inventory',
        label: 'Inventory v2.0.0',
        urlTemplate: 'https://svc2.hpgbrands.com/{brandPath}/INVENTORY/2.0.0',
        version: 'v2',
        soapAction: 'getInventoryLevels',
      },
      {
        name: 'media',
        label: 'Media Content v1.1.0',
        urlTemplate: 'https://svc2.hpgbrands.com/{brandPath}/MEDIA/1.1.0',
        version: 'v1',
        soapAction: 'getMediaContent',
      },
    ],
    responseShape: 'object',
    hasBrandPath: true,
  },

  sanmar: {
    id: 'sanmar',
    displayName: 'SanMar (UAT)',
    auth: {
      idEnvVar: 'SANMAR_ID',
      idFallback: 'WEBSERVICES-TEST',
      passwordEnvVar: 'SANMAR_PASSWORD',
      passwordFallback: 'sanmar1',
    },
    endpoints: [
      {
        name: 'productData',
        label: 'Product Data v2.0.0',
        url: 'https://uat-ws.sanmar.com:8080/promostandards/ProductDataServiceBinding',
        version: 'v2',
        soapAction: 'getProduct',
      },
      {
        name: 'inventory',
        label: 'Inventory v2.0.0',
        url: 'https://uat-ws.sanmar.com:8080/promostandards/InventoryServiceBinding',
        version: 'v2',
        soapAction: 'getInventoryLevels',
      },
      {
        name: 'media',
        label: 'Media Content v1.1.0',
        url: 'https://uat-ws.sanmar.com:8080/promostandards/MediaContentServiceBinding',
        version: 'v1',
        soapAction: 'getMediaContent',
      },
    ],
    responseShape: 'object',
    hasBrandPath: false,
  },

  logomark: {
    id: 'logomark',
    displayName: 'Logomark',
    auth: {
      idEnvVar: 'LOGOMARK_USER_ID',
      passwordEnvVar: 'LOGOMARK_PASSWORD',
    },
    endpoints: [
      {
        name: 'productDataV2',
        label: 'Product Data v2 (primary)',
        url: 'https://psapi.logomark.com/ProductDataV2Service.svc',
        version: 'v2',
        soapAction: 'getProduct',
      },
      {
        name: 'pricing',
        label: 'Pricing & Config v1',
        url: 'https://psapi.logomark.com/PricingAndConfigurationService.svc',
        version: 'v1',
        soapAction: 'GetAvailableLocations',
      },
      {
        name: 'media',
        label: 'Media Content v1.1',
        url: 'https://psapi.logomark.com/MediaContentService.svc',
        version: 'v1',
        soapAction: 'getMediaContent',
      },
      {
        name: 'inventoryV2',
        label: 'Inventory v2 (primary)',
        url: 'https://psapi.logomark.com/LogomarkInventoryV2Service.svc',
        version: 'v2',
        soapAction: 'getInventoryLevels',
      },
      {
        name: 'productDataV1',
        label: 'Product Data v1 (fallback)',
        url: 'https://psapi.logomark.com/ProductDataService.svc',
        version: 'v1',
        soapAction: 'getProduct',
      },
      {
        name: 'inventoryV1',
        label: 'Inventory v1 (fallback)',
        url: 'https://psapi.logomark.com/LogomarkInventoryService.svc',
        version: 'v1',
        soapAction: 'getInventoryLevels',
      },
    ],
    responseShape: 'array',
    hasBrandPath: false,
  },

  gemline: {
    id: 'gemline',
    displayName: 'Gemline',
    auth: {
      idEnvVar: 'GEMLINE_ACCOUNT_ID',
      passwordEnvVar: 'GEMLINE_PASSWORD',
    },
    endpoints: [
      { name: 'productDataV2', label: 'Product Data v2', url: 'https://wsp.gemline.com/GemlineWebService/ProductData/v2/GemlineProductDataService.svc', version: 'v2' },
      { name: 'productDataV1', label: 'Product Data v1', url: 'https://wsp.gemline.com/GemlineWebService/ProductData/v1/GemlineProductDataService.svc', version: 'v1' },
      { name: 'pricing', label: 'Pricing & Config v1', url: 'https://wsp.gemline.com/GemlineWebService/PricingAndConfiguration/v1/GemlinePricingAndConfigurationService.svc', version: 'v1' },
      { name: 'media', label: 'Media Content v1', url: 'https://wsp.gemline.com/GemlineWebService/MediaContent/v1/GemlineMediaContentService.svc', version: 'v1' },
      { name: 'inventoryV2', label: 'Inventory v2', url: 'https://wsp.gemline.com/GemlineWebService/Inventory/v2/GemlineInventoryService.svc', version: 'v2' },
      { name: 'inventoryV1', label: 'Inventory v1', url: 'https://wsp.gemline.com/GemlineWebService/Inventory/v1/GemlineInventoryService.svc', version: 'v1' },
    ],
    responseShape: 'array',
    hasBrandPath: false,
  },
};
