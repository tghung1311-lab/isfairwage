import { Link } from "react-router-dom";
import BrandIcon from "../components/BrandIcon";
import PrimaryButton from "../components/ui/PrimaryButton";

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <BrandIcon className="mx-auto mb-3 h-16 w-16 text-blue-600" />
        <h1 className="text-2xl font-bold text-center mb-2">IsFairWage</h1>
        <p className="text-gray-500 text-center mb-8">
          Check if you&apos;re being paid fairly before accepting casual work.
        </p>

        <div className="space-y-3">
          <Link to="/login" className="block">
            <PrimaryButton>Log in</PrimaryButton>
          </Link>
          <Link to="/signup" className="block">
            <PrimaryButton variant="secondary">Create an account</PrimaryButton>
          </Link>
          <Link to="/home" className="block text-center text-sm text-blue-600 hover:underline">
            Browse workplaces without an account
          </Link>
        </div>
      </div>
    </div>
  );
}
