import Spinner from "@/components/ui/spinner";

export default function AuthSubmitButton({
  label,
  loading,
  loadingLabel = "Please wait...",
  type = "submit",
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`btn-primary btn-lg w-full ${className}`.trim()}
    >
      {loading ? <Spinner size={17} /> : null}
      {loading ? loadingLabel : label}
    </button>
  );
}
