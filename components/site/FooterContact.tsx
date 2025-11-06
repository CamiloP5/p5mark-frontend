// components/site/FooterContact.tsx
import Link from 'next/link';

type Props = {
  address: string;
  phone: string;
  email: string;
};

export default function FooterContact({ address, phone, email }: Props) {
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;
  const mailHref = email ? `mailto:${email}` : null;

  return (
    <div className="text-sm leading-6">
      {address && <p>{address}</p>}
      {phone && (
        <p>
          Tel:{' '}
          {telHref ? (
            <Link href={telHref} className="underline-offset-2 hover:underline">
              {phone}
            </Link>
          ) : (
            phone
          )}
        </p>
      )}
      {email && (
        <p>
          Email:{' '}
          {mailHref ? (
            <Link href={mailHref} className="underline-offset-2 hover:underline">
              {email}
            </Link>
          ) : (
            email
          )}
        </p>
      )}
    </div>
  );
}
