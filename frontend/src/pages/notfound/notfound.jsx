import React from "react";
import { FormattedMessage } from "react-intl";
import "./notfound.css";

export default function NotFound() {
  return (
    <div className="container-notfound">
      <div className="window-notfound">
        <h1>
          <span className="number-notfound">404 </span>
          <span>
            <FormattedMessage
              id="notFound.pageTitle"
              defaultMessage="Page Not Found"
            />
          </span>
        </h1>
        <p>
          <FormattedMessage
            id="notFound.message"
            defaultMessage="Oops! The page you're looking for doesn't exist."
          />
        </p>
      </div>
    </div>
  );
}
