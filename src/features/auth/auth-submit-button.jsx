import Spinner from "@/components/ui/spinner";

export default function AuthSubmitButton({
  label,
  loading,
  loadingLabel = "Memproses...",
  type = "submit",
  disabled = false,
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className="btn-primary mt-1 w-full"
    >
      {loading ? <Spinner size={18} /> : null}
      {loading ? loadingLabel : label}
    </button>
  );
}