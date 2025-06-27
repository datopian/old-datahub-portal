import Link from "next/link";
import { RiHome3Line } from "react-icons/ri";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ul className="flex gap-x-8 mx-auto custom-container">
        <li className="flex gap-x-2 items-center py-2 flex-nowrap overflow-x-auto whitespace-nowrap">
          <Link
            href="/"
            className="font-semibold flex items-center text-[18px]"
            style={{ minWidth: "fit-content" }}
          >
            <RiHome3Line />
            <span className="sr-only">Home</span>
          </Link>
          {items.map((item, idx) => (
            <>
              <span key={"sep-" + idx} className="mx-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 inline"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </span>
              {item.href ? (
                <Link
                  key={"crumb-" + idx}
                  href={item.href}
                  className="font-semibold"
                  style={{ minWidth: "fit-content" }}
                >
                  {item.label}
                </Link>
              ) : (
                <span key={"crumb-" + idx} className="font-semibold">
                  {item.label}
                </span>
              )}
            </>
          ))}
        </li>
      </ul>
    </nav>
  );
} 