import { useLocation, useNavigate } from "react-router-dom";
import PrimaryButton from "../components/ui/PrimaryButton";

interface ConfirmationState {
  success: boolean;
  message: string;
  destination?: string;
  destinationLabel?: string;
}

export default function ConfirmationPage() {
  /* PATTERN: Router State — reads data passed via navigate("/confirmation", { state }) */
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ConfirmationState | null;

  const success = state?.success ?? false;
  const message = state?.message ?? "Something went wrong. No confirmation data was provided.";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center">
        {success ? (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2 text-green-700">Success!</h1>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2 text-red-700">Submission Failed</h1>
          </>
        )}

        <p className="text-gray-600 mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PrimaryButton variant="primary" fullWidth={false} onClick={() => navigate(state?.destination ?? "/home")}>
            {state?.destinationLabel ?? "Go to Home"}
          </PrimaryButton>
          <PrimaryButton variant="secondary" fullWidth={false} onClick={() => navigate("/search")}>
            Search Workplaces
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
