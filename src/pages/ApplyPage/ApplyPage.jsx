import { useParams } from "react-router-dom";

import "./ApplyPage.css";
import ApplyForm from "@/components/Jobs/ApplyForm";

export default function ApplyPage() {
  const { publicCode } = useParams();

  return (
    <div className="apply-root">
      <ApplyForm publicCode={publicCode} idPrefix="apply-page" />
    </div>
  );
}
