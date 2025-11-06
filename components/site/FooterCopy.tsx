// components/site/FooterCopy.tsx
export default function FooterCopy() {
  const year = new Date().getFullYear();
  return (
    <div className="text-sm md:text-right">
      © {year} P5 Marketing. All rights reserved.
    </div>
  );
}
