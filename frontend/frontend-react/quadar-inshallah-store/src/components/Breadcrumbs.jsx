import React from "react";
import { useBreadcrumbs, useBreadcrumbItem } from "react-aria";
import { Link, useLocation } from "react-router-dom";

function formatLabel(text) {
  return decodeURIComponent(text)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function BreadcrumbItem({ children, href, isCurrent }) {
  let ref = React.useRef();
  let { itemProps } = useBreadcrumbItem(
    { isCurrent },
    ref
  );

  return (
    <li className="flex items-center">
      <Link
        to={href}
        {...itemProps}
        ref={ref}
        className={`hover:underline ${
          isCurrent ? "font-semibold" : ""
        }`}
      >
        {children}
      </Link>

      {!isCurrent && (
        <span className="mx-2 opacity-50">/</span>
      )}
    </li>
  );
}

export default function Breadcrumbs() {
  const location = useLocation();
  const ref = React.useRef();
  const { navProps } = useBreadcrumbs({}, ref);

  const pathnames = location.pathname
    .split("/")
    .filter(Boolean);

  return (
    <nav {...navProps} ref={ref} className="px-6 py-3 text-sm">
      <ol className="flex items-center overflow-x-auto whitespace-nowrap">

        <BreadcrumbItem href="/" isCurrent={pathnames.length === 0}>
          Home
        </BreadcrumbItem>

        {pathnames.map((value, index) => {
          const to =
            "/" + pathnames.slice(0, index + 1).join("/");
          const isLast =
            index === pathnames.length - 1;

          return (
            <BreadcrumbItem
              key={to}
              href={to}
              isCurrent={isLast}
            >
              {formatLabel(value)}
            </BreadcrumbItem>
          );
        })}
      </ol>
    </nav>
  );
}