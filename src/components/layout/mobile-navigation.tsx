"use client";

import {
  IonButton,
  IonButtons,
  IonIcon,
  IonLabel,
  IonModal,
  IonTabBar,
  IonTabButton,
  IonTitle,
  IonToolbar,
  setupIonicReact,
} from "@ionic/react";
import {
  arrowBack,
  briefcase,
  briefcaseOutline,
  chevronBack,
  documentText,
  documentTextOutline,
  ellipsisHorizontalCircle,
  ellipsisHorizontalCircleOutline,
  home,
  homeOutline,
  menuOutline,
  moonOutline,
  searchOutline,
  sunnyOutline,
  trophy,
  trophyOutline,
} from "ionicons/icons";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { detectMobilePlatform } from "./mobile-platform";

const mobilePlatform =
  typeof window === "undefined"
    ? undefined
    : detectMobilePlatform(window.navigator);

setupIonicReact({ mode: mobilePlatform === "ios" ? "ios" : "md" });

interface ThemeActionProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

function MobileIcon({
  android,
  ios,
  slot,
}: {
  android: string;
  ios: string;
  slot?: "icon-only";
}) {
  if (mobilePlatform === "android") {
    return (
      <span className="jobprep-material-icon" aria-hidden="true" slot={slot}>
        {android}
      </span>
    );
  }

  return <IonIcon aria-hidden="true" icon={ios} slot={slot} />;
}

function ThemeAction({ isDark, onToggleTheme }: ThemeActionProps) {
  return (
    <IonButton aria-label="Toggle color theme" onClick={onToggleTheme}>
      <MobileIcon
        slot="icon-only"
        android={isDark ? "light_mode" : "dark_mode"}
        ios={isDark ? sunnyOutline : moonOutline}
      />
    </IonButton>
  );
}

export function MobileSiteNavigation({
  children,
  isOpen,
  onOpenChange,
  ...theme
}: ThemeActionProps & {
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const viewport = window.matchMedia(
      `(max-width: ${mobilePlatform ? 1023 : 767}px)`,
    );
    const update = () => setIsMobile(viewport.matches);
    update();
    viewport.addEventListener("change", update);
    return () => viewport.removeEventListener("change", update);
  }, []);

  return (
    <>
      <IonToolbar className="jobprep-mobile-toolbar">
        <div slot="start" className="pl-4">
          <BrandMark href="/" size="md" />
        </div>
        <IonButtons slot="end">
          <ThemeAction {...theme} />
          <IonButton
            aria-label="Open menu"
            aria-expanded={isOpen}
            onClick={() => onOpenChange(true)}
          >
            <MobileIcon android="menu" ios={menuOutline} slot="icon-only" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <IonModal
        className="jobprep-mobile-menu"
        aria-label="Menu"
        isOpen={isOpen && isMobile}
        breakpoints={[0, 1]}
        initialBreakpoint={1}
        onDidDismiss={() => onOpenChange(false)}
      >
        <div className="jobprep-mobile-menu-content">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Menu</h2>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
          {children}
        </div>
      </IonModal>
    </>
  );
}

export function MobileWorkspaceHeader({
  title,
  onSearch,
  onBack,
  ...theme
}: ThemeActionProps & {
  title: string;
  onSearch: () => void;
  onBack?: () => void;
}) {
  return (
    <IonToolbar className="jobprep-mobile-toolbar jobprep-workspace-toolbar">
      {onBack && (
        <IonButtons slot="start">
          <IonButton aria-label="Go back" onClick={onBack}>
            <IonIcon
              aria-hidden="true"
              icon={mobilePlatform === "ios" ? chevronBack : arrowBack}
              slot="icon-only"
            />
          </IonButton>
        </IonButtons>
      )}
      <IonTitle>{title}</IonTitle>
      <IonButtons slot="end">
        <IonButton aria-label="Search workspaces" onClick={onSearch}>
          <MobileIcon android="search" ios={searchOutline} slot="icon-only" />
        </IonButton>
        <ThemeAction {...theme} />
      </IonButtons>
    </IonToolbar>
  );
}

const workspaceTabs = [
  {
    label: "Home",
    href: "/dashboard",
    android: "home",
    ios: homeOutline,
    iosSelected: home,
  },
  {
    label: "Practice",
    href: "/mock-interview",
    android: "psychology",
    ios: trophyOutline,
    iosSelected: trophy,
  },
  {
    label: "Jobs",
    href: "/applications",
    android: "work",
    ios: briefcaseOutline,
    iosSelected: briefcase,
  },
  {
    label: "CV",
    href: "/cv-builder",
    android: "description",
    ios: documentTextOutline,
    iosSelected: documentText,
  },
  {
    label: "More",
    href: "/more",
    android: "more_horiz",
    ios: ellipsisHorizontalCircleOutline,
    iosSelected: ellipsisHorizontalCircle,
  },
];

export function MobileWorkspaceNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const current =
    workspaceTabs.find(
      ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
    )?.href ?? "/more";

  return (
    <IonTabBar
      className="jobprep-mobile-tabs"
      aria-label="Workspace navigation"
      selectedTab={current}
    >
      {workspaceTabs.map(({ href, android, ios, iosSelected, label }) => (
        <IonTabButton
          key={href}
          tab={href}
          href={href}
          selected={current === href}
          onClick={(event) => {
            event.preventDefault();
            if (pathname !== href) router.push(href, { scroll: false });
          }}
        >
          <span className="jobprep-tab-icon">
            <MobileIcon
              android={android}
              ios={current === href ? iosSelected : ios}
            />
          </span>
          <IonLabel>{label}</IonLabel>
        </IonTabButton>
      ))}
    </IonTabBar>
  );
}
