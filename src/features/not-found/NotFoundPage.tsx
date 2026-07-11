import { Link } from "react-router-dom";
import "./NotFoundPage.css";
import { Icon } from "../../shared/ui/Icon";

export function NotFoundPage() {
  return (
    <section className="not-found-page">
      <span className="not-found-code">404</span>
      <p className="eyebrow">Trail lost</p>
      <h1>This route leaves the mission map.</h1>
      <p>The requested screen is not part of the Phase 1 demo shell.</p>
      <Link className="primary-button" to="/roster">
        Return to roster <Icon name="arrow" />
      </Link>
    </section>
  );
}
