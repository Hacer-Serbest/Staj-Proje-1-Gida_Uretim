/**
 * Ortak "yükselen kart" yüzeyi — soft UI tasarım dilinin temel birimi.
 * Saydam değil dolu beyaz zemin + tintli gölge, sayfadan gerçekten ayrışsın diye.
 */
const Card = ({ children, className = '', hoverable = false, ...props }) => (
  <div
    className={`rounded-2xl bg-white shadow-soft-md ${
      hoverable ? 'transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-soft-lg' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
