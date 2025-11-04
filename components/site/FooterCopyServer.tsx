export default function FooterCopyServer() {
  const year = new Date().getFullYear();
  return (
    <div className="text-sm md:text-right">
      <p>© {year} P5 Marketing. All rights reserved.</p>
    </div>
  );
}
