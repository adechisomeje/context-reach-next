"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  route?: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  highlightPadding?: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to ContextReach! 🎉",
    description: "Let's take a quick tour to help you get started with personalized outreach.",
    position: "center",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "This is your home base. View your recent campaigns, credit balance, and quick stats at a glance.",
    route: "/dashboard",
    position: "center",
  },
  {
    id: "discover",
    title: "Discover Prospects",
    description: "Start here to find and research potential contacts. Enter a company URL and we'll help you discover decision makers.",
    targetSelector: '[href="/discover"]',
    route: "/discover",
    position: "right",
  },
  {
    id: "campaigns",
    title: "Campaigns",
    description: "Manage all your outreach campaigns here. Track opens, replies, and engagement metrics.",
    targetSelector: '[href="/campaigns"]',
    route: "/campaigns",
    position: "right",
  },
  {
    id: "contacts",
    title: "Contacts",
    description: "Your contact database. View all discovered contacts and their outreach status.",
    targetSelector: '[href="/contacts"]',
    route: "/contacts",
    position: "right",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Customize your email signatures, manage Gmail connection, and configure your preferences.",
    targetSelector: '[href="/settings"]',
    route: "/settings",
    position: "right",
  },
  {
    id: "complete",
    title: "You're All Set! 🚀",
    description: "Start by discovering prospects for your first campaign. Click 'Discover' in the sidebar to begin!",
    position: "center",
  },
];

const TOUR_STORAGE_KEY = "contextreach_tour_completed";

interface AppTourProps {
  onComplete?: () => void;
}

export function AppTour({ onComplete }: AppTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const step = TOUR_STEPS[currentStep];

  // Check if tour should start
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const startTour = params.get("tour");
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    
    if (startTour === "true" && !tourCompleted) {
      setIsActive(true);
      // Clean up URL
      window.history.replaceState({}, "", pathname);
    }
  }, [pathname]);

  // Update target element position
  const updateTargetPosition = useCallback(() => {
    if (!step?.targetSelector) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [step]);

  // Handle route changes for tour
  useEffect(() => {
    if (!isActive || !step) return;

    // If step requires a route change
    if (step.route && pathname !== step.route && !isNavigating) {
      setIsNavigating(true);
      router.push(step.route);
      return;
    }

    // Reset navigating state when we arrive at the correct route
    if (step.route && pathname === step.route) {
      setIsNavigating(false);
      // Wait for DOM to update before finding target
      setTimeout(updateTargetPosition, 300);
    } else if (!step.route) {
      updateTargetPosition();
    }
  }, [isActive, step, pathname, router, isNavigating, updateTargetPosition]);

  // Update position on window resize
  useEffect(() => {
    if (!isActive) return;
    
    window.addEventListener("resize", updateTargetPosition);
    return () => window.removeEventListener("resize", updateTargetPosition);
  }, [isActive, updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setIsActive(false);
    setCurrentStep(0);
    onComplete?.();
    // Navigate to discover page to encourage first action
    router.push("/discover");
  };

  if (!isActive || !step) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isCentered = step.position === "center" || !targetRect;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (isCentered) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = step.highlightPadding || 8;
    const tooltipOffset = 12;

    switch (step.position) {
      case "right":
        return {
          position: "fixed",
          top: targetRect!.top + targetRect!.height / 2,
          left: targetRect!.right + padding + tooltipOffset,
          transform: "translateY(-50%)",
        };
      case "left":
        return {
          position: "fixed",
          top: targetRect!.top + targetRect!.height / 2,
          right: window.innerWidth - targetRect!.left + padding + tooltipOffset,
          transform: "translateY(-50%)",
        };
      case "bottom":
        return {
          position: "fixed",
          top: targetRect!.bottom + padding + tooltipOffset,
          left: targetRect!.left + targetRect!.width / 2,
          transform: "translateX(-50%)",
        };
      case "top":
        return {
          position: "fixed",
          bottom: window.innerHeight - targetRect!.top + padding + tooltipOffset,
          left: targetRect!.left + targetRect!.width / 2,
          transform: "translateX(-50%)",
        };
      default:
        return {};
    }
  };

  // Get highlight box style
  const getHighlightStyle = (): React.CSSProperties | null => {
    if (!targetRect) return null;
    
    const padding = step.highlightPadding || 8;
    return {
      position: "fixed",
      top: targetRect.top - padding,
      left: targetRect.left - padding,
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2,
      borderRadius: "8px",
      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
      pointerEvents: "none",
      zIndex: 9998,
    };
  };

  const highlightStyle = getHighlightStyle();

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[9997]"
        style={{ backgroundColor: isCentered ? "rgba(0, 0, 0, 0.5)" : "transparent" }}
      />

      {/* Highlight box for target element */}
      {highlightStyle && <div style={highlightStyle} />}

      {/* Tooltip */}
      <div
        className="z-[9999] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-md"
        style={getTooltipStyle()}
      >
        {/* Progress indicator */}
        <div className="flex items-center gap-1 mb-4">
          {TOUR_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep
                  ? "w-6 bg-blue-600"
                  : index < currentStep
                  ? "w-3 bg-blue-400"
                  : "w-3 bg-slate-200 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {step.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {step.description}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Skip tour
          </button>
          
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
              >
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLastStep ? "Get Started" : "Next"}
            </Button>
          </div>
        </div>
      </div>

      {/* Arrow pointer for non-centered tooltips */}
      {!isCentered && targetRect && (
        <div
          className="fixed z-[9999] w-3 h-3 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700"
          style={{
            ...getArrowStyle(step.position, targetRect, step.highlightPadding || 8),
          }}
        />
      )}
    </>
  );
}

// Helper function for arrow positioning
function getArrowStyle(
  position: string,
  targetRect: DOMRect,
  padding: number
): React.CSSProperties {
  const offset = 6;
  
  switch (position) {
    case "right":
      return {
        top: targetRect.top + targetRect.height / 2 - 6,
        left: targetRect.right + padding + offset,
        transform: "rotate(-45deg)",
      };
    case "left":
      return {
        top: targetRect.top + targetRect.height / 2 - 6,
        right: window.innerWidth - targetRect.left + padding + offset,
        transform: "rotate(135deg)",
      };
    case "bottom":
      return {
        top: targetRect.bottom + padding + offset,
        left: targetRect.left + targetRect.width / 2 - 6,
        transform: "rotate(45deg)",
      };
    case "top":
      return {
        bottom: window.innerHeight - targetRect.top + padding + offset,
        left: targetRect.left + targetRect.width / 2 - 6,
        transform: "rotate(-135deg)",
      };
    default:
      return {};
  }
}

// Hook to start the tour programmatically
export function useAppTour() {
  const startTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.location.href = "/dashboard?tour=true";
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  };

  const isTourCompleted = () => {
    return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  };

  return { startTour, resetTour, isTourCompleted };
}
