export function OrganizationJsonLd({
  name = 'Reunion OS',
  url = 'https://reunion.family',
  description = 'White-glove family reunion operations platform — intake to delivery.',
}: {
  name?: string;
  url?: string;
  description?: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
