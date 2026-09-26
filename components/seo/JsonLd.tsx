import Script from "next/script";
import {
  openingHoursSpecification,
  parseAustralianAddress,
} from "@/lib/store-contact";

interface LocalBusinessJsonLdProps {
  name: string;
  url: string;
  telephone?: string | null;
  address?: string | null;
  image?: string | null;
  menuUrl?: string | null;
  openingHours?: unknown;
  priceRange?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function LocalBusinessJsonLd({
  name,
  url,
  telephone,
  address,
  image,
  menuUrl,
  openingHours,
  priceRange = "$$",
  latitude,
  longitude,
}: LocalBusinessJsonLdProps): React.ReactElement {
  const postal = parseAustralianAddress(address);
  const hoursSpec = openingHoursSpecification(openingHours);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name,
    url,
    servesCuisine: "Pizza",
    priceRange,
    ...(telephone ? { telephone } : {}),
    ...(image ? { image } : {}),
    ...(menuUrl ? { hasMenu: menuUrl, menu: menuUrl } : {}),
    ...(postal
      ? {
          address: {
            "@type": "PostalAddress",
            ...postal,
          },
        }
      : {}),
    ...(latitude != null && longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude,
            longitude,
          },
        }
      : {}),
    ...(hoursSpec.length > 0 ? { openingHoursSpecification: hoursSpec } : {}),
  };

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="local-business-jsonld"
      type="application/ld+json"
    />
  );
}

interface MenuItemJsonLdProps {
  name: string;
  description?: string | null;
  image?: string | null;
  url: string;
  price?: number;
}

export function MenuItemJsonLd({
  name,
  description,
  image,
  url,
  price,
}: MenuItemJsonLdProps): React.ReactElement {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description ?? undefined,
    image: image ?? undefined,
    url,
    ...(price != null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "AUD",
            price: price.toFixed(2),
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="menu-item-jsonld"
      type="application/ld+json"
    />
  );
}

interface BlogPostingJsonLdProps {
  title: string;
  description?: string | null;
  url: string;
  datePublished?: string | null;
  author?: string | null;
  image?: string | null;
}

export function BlogPostingJsonLd({
  title,
  description,
  url,
  datePublished,
  author,
  image,
}: BlogPostingJsonLdProps): React.ReactElement {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description ?? undefined,
    url,
    datePublished: datePublished ?? undefined,
    author: author ? { "@type": "Person", name: author } : undefined,
    image: image ?? undefined,
  };

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="blog-post-jsonld"
      type="application/ld+json"
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps): React.ReactElement {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="breadcrumb-jsonld"
      type="application/ld+json"
    />
  );
}
