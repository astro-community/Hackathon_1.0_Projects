export const prettyCategoryName = (category: string) =>
  ({
    ssr: 'SSR',
    theme: 'Themes',
    integration: 'Integrations',
  }[category.toLowerCase()]);
