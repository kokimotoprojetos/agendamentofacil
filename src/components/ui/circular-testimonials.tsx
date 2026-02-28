"use client";
import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
} from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Testimonial {
    quote: string;
    name: string;
    designation: string;
    src: string;
}

interface Colors {
    name?: string;
    designation?: string;
    testimony?: string;
    arrowBackground?: string;
    arrowForeground?: string;
    arrowHoverBackground?: string;
}

interface FontSizes {
    name?: string;
    designation?: string;
    quote?: string;
}

interface CircularTestimonialsProps {
    testimonials: Testimonial[];
    autoplay?: boolean;
    colors?: Colors;
    fontSizes?: FontSizes;
    className?: string;
}

function calculateGap(width: number) {
    const minWidth = 1024;
    const maxWidth = 1456;
    const minGap = 60;
    const maxGap = 86;
    if (width <= minWidth) return minGap;
    if (width >= maxWidth)
        return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
    return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export const CircularTestimonials = ({
    testimonials,
    autoplay = true,
    colors = {},
    fontSizes = {},
    className,
}: CircularTestimonialsProps) => {
    // Color & font config
    const colorName = colors.name ?? "#0f172a";
    const colorDesignation = colors.designation ?? "#64748b";
    const colorTestimony = colors.testimony ?? "#475569";
    const colorArrowBg = colors.arrowBackground ?? "#4f46e5";
    const colorArrowFg = colors.arrowForeground ?? "#ffffff";
    const colorArrowHoverBg = colors.arrowHoverBackground ?? "#4338ca";
    const fontSizeName = fontSizes.name ?? "1.875rem";
    const fontSizeDesignation = fontSizes.designation ?? "1rem";
    const fontSizeQuote = fontSizes.quote ?? "1.125rem";

    // State
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoverPrev, setHoverPrev] = useState(false);
    const [hoverNext, setHoverNext] = useState(false);
    const [containerWidth, setContainerWidth] = useState(1200);

    const imageContainerRef = useRef<HTMLDivElement>(null);
    const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const testimonialsLength = useMemo(() => testimonials.length, [testimonials]);
    const activeTestimonial = useMemo(
        () => testimonials[activeIndex],
        [activeIndex, testimonials]
    );

    // Responsive gap calculation
    useEffect(() => {
        function handleResize() {
            if (imageContainerRef.current) {
                setContainerWidth(imageContainerRef.current.offsetWidth);
            }
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Autoplay
    useEffect(() => {
        if (autoplay) {
            autoplayIntervalRef.current = setInterval(() => {
                setActiveIndex((prev) => (prev + 1) % testimonialsLength);
            }, 8000);
        }
        return () => {
            if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
        };
    }, [autoplay, testimonialsLength]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [activeIndex, testimonialsLength, handleNext, handlePrev]);

    // Navigation handlers
    const handleNext = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % testimonialsLength);
        if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    }, [testimonialsLength]);

    const handlePrev = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength);
        if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    }, [testimonialsLength]);

    // Compute transforms for each image
    function getImageStyle(index: number): React.CSSProperties {
        const gap = calculateGap(containerWidth);
        const maxStickUp = gap * 0.8;
        const isActive = index === activeIndex;
        const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
        const isRight = (activeIndex + 1) % testimonialsLength === index;

        if (isActive) {
            return {
                zIndex: 3,
                opacity: 1,
                pointerEvents: "auto",
                transform: `translateX(0px) translateY(0px) scale(1) rotateY(0deg)`,
                transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
            };
        }
        if (isLeft) {
            return {
                zIndex: 2,
                opacity: 1,
                pointerEvents: "auto",
                transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
                transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
            };
        }
        if (isRight) {
            return {
                zIndex: 2,
                opacity: 1,
                pointerEvents: "auto",
                transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
                transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
            };
        }
        return {
            zIndex: 1,
            opacity: 0,
            pointerEvents: "none",
            transform: `translateX(0px) translateY(0px) scale(0.5) rotateY(0deg)`,
            transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
        };
    }

    const quoteVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    return (
        <div className={cn("w-full max-w-5xl mx-auto px-4 py-8", className)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Images */}
                <div className="relative w-full h-[300px] md:h-[450px] [perspective:1000px]" ref={imageContainerRef}>
                    {testimonials.map((testimonial, index) => (
                        <img
                            key={testimonial.src}
                            src={testimonial.src}
                            alt={testimonial.name}
                            className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/20"
                            style={getImageStyle(index)}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center text-left">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            variants={quoteVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="space-y-4"
                        >
                            <div>
                                <h3
                                    className="font-black tracking-tight"
                                    style={{ color: colorName, fontSize: fontSizeName }}
                                >
                                    {activeTestimonial.name}
                                </h3>
                                <p
                                    className="font-semibold"
                                    style={{ color: colorDesignation, fontSize: fontSizeDesignation }}
                                >
                                    {activeTestimonial.designation}
                                </p>
                            </div>

                            <motion.p
                                className="leading-relaxed font-medium bg-white/40 p-6 rounded-2xl border border-white/60 backdrop-blur-sm"
                                style={{ color: colorTestimony, fontSize: fontSizeQuote }}
                            >
                                {activeTestimonial.quote.split(" ").map((word, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                                        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.25,
                                            ease: "easeInOut",
                                            delay: 0.015 * i,
                                        }}
                                        className="inline-block"
                                    >
                                        {word}&nbsp;
                                    </motion.span>
                                ))}
                            </motion.p>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex gap-4 mt-12">
                        <button
                            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 border shadow-lg"
                            onClick={handlePrev}
                            style={{
                                backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg,
                                borderColor: 'rgba(255,255,255,0.2)'
                            }}
                            onMouseEnter={() => setHoverPrev(true)}
                            onMouseLeave={() => setHoverPrev(false)}
                            aria-label="Previous testimonial"
                        >
                            <FaArrowLeft size={24} color={colorArrowFg} />
                        </button>
                        <button
                            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 border shadow-lg"
                            onClick={handleNext}
                            style={{
                                backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg,
                                borderColor: 'rgba(255,255,255,0.2)'
                            }}
                            onMouseEnter={() => setHoverNext(true)}
                            onMouseLeave={() => setHoverNext(false)}
                            aria-label="Next testimonial"
                        >
                            <FaArrowRight size={24} color={colorArrowFg} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CircularTestimonials;
