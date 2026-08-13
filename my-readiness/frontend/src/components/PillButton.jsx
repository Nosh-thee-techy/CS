export default function PillButton({
  children,
  variant = "white",
  type = "button",
  disabled,
  onClick,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={variant === "ember" ? "btn-pill-ember" : "btn-pill-white"}
    >
      {children}
    </button>
  );
}
