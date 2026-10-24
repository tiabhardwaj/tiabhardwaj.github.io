import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const pieces = defineCollection({
    loader: glob({
        base: "./src/content/pieces",
        pattern: "**/*.md",
    }),

    schema: z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),

        sections: z.array(
        z.enum(["writing", "work", "research", "startup"])
        ).min(1),
    }),
});

export const collections = { pieces };