"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMotionValue, useSpring, animate } from "framer-motion";

interface GlowingEffectProps {
    blur?: number;
    inactiveZone?: number;
    proximity?: number;
    spread?: number;
    variant?: "default" | "white";
    glow?: boolean;
    className?: string;
    disabled?: boolean;
    movementDuration?: number;
    borderWidth?: number;
}

const GlowingEffect = memo(
    ({
        blur = 0,
        inactiveZone = 0.7,
        proximity = 0,
        spread = 20,
        variant = "default",
        glow = false,
        className,
        movementDuration = 2,
        borderWidth = 1,
        disabled = false,
    }: GlowingEffectProps) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const rectRef = useRef<DOMRect | null>(null);
        const lastPosition = useRef({ x: 0, y: 0 });
        const [isTouchDevice, setIsTouchDevice] = useState(false);

        const startAngle = useMotionValue(0);
        const activeValue = useMotionValue(0);

        const springConfig = {
            duration: movementDuration,
            bounce: 0,
        };

        const springAngle = useSpring(startAngle, springConfig);
        const springActive = useSpring(activeValue, { duration: 0.3, bounce: 0 });

        useEffect(() => {
            const checkTouch = () => {
                setIsTouchDevice(
                    "ontouchstart" in window || navigator.maxTouchPoints > 0
                );
            };
            checkTouch();
        }, []);

        const updateRect = useCallback(() => {
            if (containerRef.current) {
                rectRef.current = containerRef.current.getBoundingClientRect();
            }
        }, []);

        const handleMove = useCallback(
            (e?: MouseEvent | { x: number; y: number }) => {
                if (!containerRef.current || (isTouchDevice && !glow)) return;

                if (!rectRef.current) {
                    updateRect();
                }
                const rect = rectRef.current;
                if (!rect) return;

                const mouseX = e?.x ?? lastPosition.current.x;
                const mouseY = e?.y ?? lastPosition.current.y;

                if (e) {
                    lastPosition.current = { x: mouseX, y: mouseY };
                }

                const center = [rect.left + rect.width * 0.5, rect.top + rect.height * 0.5];
                const distanceFromCenter = Math.hypot(
                    mouseX - center[0],
                    mouseY - center[1]
                );
                const inactiveRadius = 0.5 * Math.min(rect.width, rect.height) * inactiveZone;

                if (distanceFromCenter < inactiveRadius) {
                    activeValue.set(0);
                    return;
                }

                const isActive =
                    mouseX > rect.left - proximity &&
                    mouseX < rect.left + rect.width + proximity &&
                    mouseY > rect.top - proximity &&
                    mouseY < rect.top + rect.height + proximity;

                activeValue.set(isActive ? 1 : 0);

                if (!isActive) return;

                const currentAngle = startAngle.get();
                let targetAngle =
                    (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
                    Math.PI +
                    90;

                const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
                const newAngle = currentAngle + angleDiff;

                startAngle.set(newAngle);
            },
            [inactiveZone, proximity, glow, isTouchDevice, activeValue, startAngle, updateRect]
        );

        useEffect(() => {
            if (disabled || isTouchDevice) return;

            const handleScroll = () => {
                updateRect();
                handleMove();
            };
            const handlePointerMove = (e: PointerEvent) => handleMove(e);
            const handleResize = () => updateRect();

            window.addEventListener("scroll", handleScroll, { passive: true });
            window.addEventListener("resize", handleResize, { passive: true });
            document.body.addEventListener("pointermove", handlePointerMove, {
                passive: true,
            });

            return () => {
                window.removeEventListener("scroll", handleScroll);
                window.removeEventListener("resize", handleResize);
                document.body.removeEventListener("pointermove", handlePointerMove);
            };
        }, [handleMove, disabled, isTouchDevice, updateRect]);

        useEffect(() => {
            if (!containerRef.current) return;
            const element = containerRef.current;

            const unsubscribeAngle = springAngle.on("change", (value) => {
                element.style.setProperty("--start", String(value));
            });

            const unsubscribeActive = springActive.on("change", (value) => {
                element.style.setProperty("--active", String(value));
            });

            return () => {
                unsubscribeAngle();
                unsubscribeActive();
            };
        }, [springAngle, springActive]);

        // If it's a touch device and glow isn't forced, don't render the animation layer for performance
        if (isTouchDevice && !glow) {
            return (
                <div
                    className={cn(
                        "pointer-events-none absolute -inset-px rounded-[inherit] border border-border/50 opacity-0 transition-opacity",
                        className
                    )}
                />
            );
        }

        return (
            <>
                <div
                    className={cn(
                        "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
                        glow && "opacity-100",
                        variant === "white" && "border-white",
                        (disabled || isTouchDevice) && "!block"
                    )}
                />
                <div
                    ref={containerRef}
                    style={
                        {
                            "--blur": `${blur}px`,
                            "--spread": spread,
                            "--start": "0",
                            "--active": "0",
                            "--glowingeffect-border-width": `${borderWidth}px`,
                            "--repeating-conic-gradient-times": "5",
                            "--gradient":
                                variant === "white"
                                    ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black),
                  var(--black) calc(25% / var(--repeating-conic-gradient-times))
                )`
                                    : `radial-gradient(circle, #f46025 10%, #f4602500 20%),
                radial-gradient(circle at 40% 40%, #ff8a50 5%, #ff8a5000 15%),
                radial-gradient(circle at 60% 60%, #bf360c 10%, #bf360c00 20%), 
                radial-gradient(circle at 40% 60%, #e64a19 10%, #e64a1900 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  #f46025 0%,
                  #ff8a50 calc(25% / var(--repeating-conic-gradient-times)),
                  #bf360c calc(50% / var(--repeating-conic-gradient-times)), 
                  #e64a19 calc(75% / var(--repeating-conic-gradient-times)),
                  #f46025 calc(100% / var(--repeating-conic-gradient-times))
                )`,
                        } as React.CSSProperties
                    }
                    className={cn(
                        "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity will-change-[transform,opacity]",
                        glow && "opacity-100",
                        blur > 0 && "blur-[var(--blur)] ",
                        className,
                        disabled && "!hidden"
                    )}
                >
                    <div
                        className={cn(
                            "glow",
                            "rounded-[inherit]",
                            'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
                            "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
                            "after:[background:var(--gradient)] after:[background-attachment:fixed]",
                            "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
                            "after:[mask-clip:padding-box,border-box]",
                            "after:[mask-composite:intersect]",
                            "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
                        )}
                    />
                </div>
            </>
        );
    }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
