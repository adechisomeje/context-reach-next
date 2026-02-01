"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineStatusResponse, PipelinePhase, PhaseStatus } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";

// Lottie animation data for each phase (inline JSON for reliability)
const searchAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Search",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Magnifier",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [0], e: [15] }, { t: 15, s: [15], e: [-15] }, { t: 30, s: [-15], e: [15] }, { t: 45, s: [15], e: [0] }, { t: 60, s: [0] }] },
        p: { a: 1, k: [{ t: 0, s: [100, 100, 0], e: [110, 90, 0] }, { t: 15, s: [110, 90, 0], e: [90, 110, 0] }, { t: 30, s: [90, 110, 0], e: [110, 90, 0] }, { t: 45, s: [110, 90, 0], e: [100, 100, 0] }, { t: 60, s: [100, 100, 0] }] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [60, 60] }, p: { a: 0, k: [0, -15] }, nm: "Circle" },
            { ty: "st", c: { a: 0, k: [0.545, 0.361, 0.965, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 8 }, lc: 2, lj: 2 },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ],
          nm: "Circle"
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [8, 35] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 4 } },
            { ty: "fl", c: { a: 0, k: [0.545, 0.361, 0.965, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [22, 32] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 45 }, o: { a: 0, k: 100 } }
          ],
          nm: "Handle"
        }
      ]
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Dots",
      sr: 1,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [100, 130, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 1, k: [{ t: 0, s: [8, 8], e: [12, 12] }, { t: 15, s: [12, 12], e: [8, 8] }, { t: 30, s: [8, 8] }] }, p: { a: 0, k: [-30, 0] } },
            { ty: "fl", c: { a: 0, k: [0.545, 0.361, 0.965, 0.5] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 1, k: [{ t: 10, s: [8, 8], e: [12, 12] }, { t: 25, s: [12, 12], e: [8, 8] }, { t: 40, s: [8, 8] }] }, p: { a: 0, k: [0, 0] } },
            { ty: "fl", c: { a: 0, k: [0.545, 0.361, 0.965, 0.5] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 1, k: [{ t: 20, s: [8, 8], e: [12, 12] }, { t: 35, s: [12, 12], e: [8, 8] }, { t: 50, s: [8, 8] }] }, p: { a: 0, k: [30, 0] } },
            { ty: "fl", c: { a: 0, k: [0.545, 0.361, 0.965, 0.5] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    }
  ]
};

const researchAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "Research",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Bulb",
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [50], e: [100] }, { t: 20, s: [100], e: [50] }, { t: 40, s: [50], e: [100] }, { t: 60, s: [100], e: [50] }, { t: 80, s: [50], e: [50] }, { t: 90, s: [50] }] },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 90, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [100, 100, 100], e: [105, 105, 100] }, { t: 20, s: [105, 105, 100], e: [100, 100, 100] }, { t: 40, s: [100, 100, 100], e: [105, 105, 100] }, { t: 60, s: [105, 105, 100], e: [100, 100, 100] }, { t: 90, s: [100, 100, 100] }] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [50, 50] }, p: { a: 0, k: [0, -10] } },
            { ty: "fl", c: { a: 0, k: [0.024, 0.714, 0.831, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [20, 15] }, p: { a: 0, k: [0, 22] }, r: { a: 0, k: 3 } },
            { ty: "fl", c: { a: 0, k: [0.024, 0.714, 0.831, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Rays",
      sr: 1,
      ks: { o: { a: 0, k: 100 }, r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 90, s: [360] }] }, p: { a: 0, k: [100, 80, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [4, 15] }, p: { a: 0, k: [0, -50] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.024, 0.714, 0.831, 0.6] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [4, 15] }, p: { a: 0, k: [0, -50] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.024, 0.714, 0.831, 0.6] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 60 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [4, 15] }, p: { a: 0, k: [0, -50] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.024, 0.714, 0.831, 0.6] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 120 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [4, 15] }, p: { a: 0, k: [0, -50] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.024, 0.714, 0.831, 0.6] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 180 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [4, 15] }, p: { a: 0, k: [0, -50] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.024, 0.714, 0.831, 0.6] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 240 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [4, 15] }, p: { a: 0, k: [0, -50] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.024, 0.714, 0.831, 0.6] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 300 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Gears",
      sr: 1,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [100, 150, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [20, 20] }, p: { a: 0, k: [-25, 0] } },
            { ty: "st", c: { a: 0, k: [0.024, 0.714, 0.831, 0.4] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 60, s: [360] }] }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [20, 20] }, p: { a: 0, k: [25, 0] } },
            { ty: "st", c: { a: 0, k: [0.024, 0.714, 0.831, 0.4] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 1, k: [{ t: 0, s: [360], e: [0] }, { t: 60, s: [0] }] }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    }
  ]
};

const emailAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Email",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Envelope",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 1, k: [{ t: 0, s: [100, 110, 0], e: [100, 100, 0] }, { t: 15, s: [100, 100, 0], e: [100, 110, 0] }, { t: 30, s: [100, 110, 0], e: [100, 100, 0] }, { t: 45, s: [100, 100, 0], e: [100, 110, 0] }, { t: 60, s: [100, 110, 0] }] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [80, 50] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 6 } },
            { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "sh", ks: { a: 0, k: { c: false, v: [[-40, -25], [0, 5], [40, -25]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] } } },
            { ty: "st", c: { a: 0, k: [1, 1, 1, 0.8] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 }, lc: 2, lj: 2 },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "SendLines",
      sr: 1,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [100, 100, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 1, k: [{ t: 0, s: [0, 3], e: [30, 3] }, { t: 15, s: [30, 3], e: [0, 3] }, { t: 30, s: [0, 3] }] }, p: { a: 1, k: [{ t: 0, s: [55, -15, 0], e: [70, -15, 0] }, { t: 15, s: [70, -15, 0], e: [55, -15, 0] }, { t: 30, s: [55, -15, 0] }] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 0.6] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 1, k: [{ t: 10, s: [0, 3], e: [25, 3] }, { t: 25, s: [25, 3], e: [0, 3] }, { t: 40, s: [0, 3] }] }, p: { a: 1, k: [{ t: 10, s: [55, 0, 0], e: [68, 0, 0] }, { t: 25, s: [68, 0, 0], e: [55, 0, 0] }, { t: 40, s: [55, 0, 0] }] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 0.6] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 1, k: [{ t: 20, s: [0, 3], e: [20, 3] }, { t: 35, s: [20, 3], e: [0, 3] }, { t: 50, s: [0, 3] }] }, p: { a: 1, k: [{ t: 20, s: [55, 15, 0], e: [65, 15, 0] }, { t: 35, s: [65, 15, 0], e: [55, 15, 0] }, { t: 50, s: [55, 15, 0] }] }, r: { a: 0, k: 2 } },
            { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 0.6] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Sparkles",
      sr: 1,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [100, 100, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "sr", sy: 1, pt: { a: 0, k: 4 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 3 }, is: { a: 0, k: 0 }, or: { a: 0, k: 6 }, os: { a: 0, k: 0 } },
            { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 1, k: [{ t: 0, s: [0], e: [100] }, { t: 15, s: [100], e: [0] }, { t: 30, s: [0] }] } },
            { ty: "tr", p: { a: 0, k: [-50, -30] }, a: { a: 0, k: [0, 0] }, s: { a: 1, k: [{ t: 0, s: [0, 0], e: [100, 100] }, { t: 15, s: [100, 100], e: [0, 0] }, { t: 30, s: [0, 0] }] }, r: { a: 1, k: [{ t: 0, s: [0], e: [90] }, { t: 30, s: [90] }] }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "sr", sy: 1, pt: { a: 0, k: 4 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 3 }, is: { a: 0, k: 0 }, or: { a: 0, k: 6 }, os: { a: 0, k: 0 } },
            { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 1, k: [{ t: 20, s: [0], e: [100] }, { t: 35, s: [100], e: [0] }, { t: 50, s: [0] }] } },
            { ty: "tr", p: { a: 0, k: [50, -35] }, a: { a: 0, k: [0, 0] }, s: { a: 1, k: [{ t: 20, s: [0, 0], e: [100, 100] }, { t: 35, s: [100, 100], e: [0, 0] }, { t: 50, s: [0, 0] }] }, r: { a: 1, k: [{ t: 20, s: [0], e: [90] }, { t: 50, s: [90] }] }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "sr", sy: 1, pt: { a: 0, k: 4 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 3 }, is: { a: 0, k: 0 }, or: { a: 0, k: 6 }, os: { a: 0, k: 0 } },
            { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 1, k: [{ t: 40, s: [0], e: [100] }, { t: 55, s: [100], e: [0] }, { t: 60, s: [0] }] } },
            { ty: "tr", p: { a: 0, k: [-55, 10] }, a: { a: 0, k: [0, 0] }, s: { a: 1, k: [{ t: 40, s: [0, 0], e: [100, 100] }, { t: 55, s: [100, 100], e: [0, 0] }, { t: 60, s: [0, 0] }] }, r: { a: 1, k: [{ t: 40, s: [0], e: [90] }, { t: 60, s: [90] }] }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    }
  ]
};

const successAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Success",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Check",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [0, 0, 100], e: [110, 110, 100] }, { t: 15, s: [110, 110, 100], e: [100, 100, 100] }, { t: 25, s: [100, 100, 100] }] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [70, 70] }, p: { a: 0, k: [0, 0] } },
            { ty: "fl", c: { a: 0, k: [0.196, 0.804, 0.502, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "sh", ks: { a: 0, k: { c: false, v: [[-15, 0], [-5, 10], [15, -10]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] } } },
            { ty: "st", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 6 }, lc: 2, lj: 2 },
            { ty: "tm", s: { a: 1, k: [{ t: 15, s: [0], e: [0] }, { t: 35, s: [0] }] }, e: { a: 1, k: [{ t: 15, s: [0], e: [100] }, { t: 35, s: [100] }] }, o: { a: 0, k: 0 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Confetti",
      sr: 1,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [100, 100, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [8, 8] }, p: { a: 1, k: [{ t: 20, s: [0, 0, 0], e: [-40, -50, 0] }, { t: 45, s: [-40, -50, 0] }] } },
            { ty: "fl", c: { a: 0, k: [0.196, 0.804, 0.502, 1] }, o: { a: 1, k: [{ t: 20, s: [100], e: [0] }, { t: 45, s: [0] }] } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [8, 8] }, p: { a: 1, k: [{ t: 22, s: [0, 0, 0], e: [45, -45, 0] }, { t: 47, s: [45, -45, 0] }] } },
            { ty: "fl", c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, o: { a: 1, k: [{ t: 22, s: [100], e: [0] }, { t: 47, s: [0] }] } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [8, 8] }, p: { a: 1, k: [{ t: 24, s: [0, 0, 0], e: [-50, -30, 0] }, { t: 49, s: [-50, -30, 0] }] } },
            { ty: "fl", c: { a: 0, k: [0.4, 0.851, 0.678, 1] }, o: { a: 1, k: [{ t: 24, s: [100], e: [0] }, { t: 49, s: [0] }] } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [8, 8] }, p: { a: 1, k: [{ t: 26, s: [0, 0, 0], e: [50, -35, 0] }, { t: 51, s: [50, -35, 0] }] } },
            { ty: "fl", c: { a: 0, k: [0.545, 0.361, 0.965, 1] }, o: { a: 1, k: [{ t: 26, s: [100], e: [0] }, { t: 51, s: [0] }] } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [8, 8] }, p: { a: 1, k: [{ t: 28, s: [0, 0, 0], e: [-30, -55, 0] }, { t: 53, s: [-30, -55, 0] }] } },
            { ty: "fl", c: { a: 0, k: [0.024, 0.714, 0.831, 1] }, o: { a: 1, k: [{ t: 28, s: [100], e: [0] }, { t: 53, s: [0] }] } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        },
        {
          ty: "gr",
          it: [
            { ty: "el", s: { a: 0, k: [8, 8] }, p: { a: 1, k: [{ t: 30, s: [0, 0, 0], e: [35, -55, 0] }, { t: 55, s: [35, -55, 0] }] } },
            { ty: "fl", c: { a: 0, k: [0.196, 0.804, 0.502, 1] }, o: { a: 1, k: [{ t: 30, s: [100], e: [0] }, { t: 55, s: [0] }] } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ]
    }
  ]
};

const phaseAnimations: Record<PipelinePhase, object> = {
  discovery: searchAnimation,
  research: researchAnimation,
  composition: emailAnimation,
};

interface PipelineProgressProps {
  status: PipelineStatusResponse;
  onViewCampaignStatus?: () => void;
}

const phaseConfig: Record<PipelinePhase, { label: string; icon: React.ReactNode; gradient: string; bgGradient: string }> = {
  discovery: {
    label: "Finding Contacts",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/20 to-purple-600/20",
  },
  research: {
    label: "Researching Companies",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    gradient: "from-cyan-500 to-blue-600",
    bgGradient: "from-cyan-500/20 to-blue-600/20",
  },
  composition: {
    label: "Creating Email Sequences",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-500/20 to-teal-600/20",
  },
};

const statusIcons: Record<PhaseStatus, React.ReactNode> = {
  pending: (
    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-slate-400" />
    </div>
  ),
  in_progress: (
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
      <div className="absolute inset-1 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
      </div>
    </div>
  ),
  completed: (
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  failed: (
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  ),
};

// Simple connector between phases (CSS-based, no GSAP)
function ProcessingConnector({ 
  isActive, 
  isCompleted,
  fromGradient,
}: { 
  isActive: boolean; 
  isCompleted: boolean;
  fromGradient: string;
}) {
  if (isCompleted) {
    // Completed state - show flowing line with checkmark
    return (
      <div className="flex items-center justify-center px-1 pt-8">
        <div className="relative flex items-center">
          <div className="w-6 h-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-sm shadow-green-500/50" />
          <div className="relative w-6 h-6 mx-1">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="w-6 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/50" />
        </div>
      </div>
    );
  }

  if (isActive) {
    // Active processing state - CSS-only circular animation
    return (
      <div className="flex items-center justify-center px-1 pt-8">
        <div className="relative w-12 h-12">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${fromGradient} opacity-20 blur-md animate-pulse`} />
          <div className="absolute inset-1 rounded-full border-2 border-slate-200 dark:border-slate-700" />
          
          {/* CSS spinning ring */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "2s" }}>
            <svg className="w-full h-full" viewBox="0 0 48 48">
              <defs>
                <linearGradient id="processingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="url(#processingGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="40 80"
              />
            </svg>
          </div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${fromGradient} flex items-center justify-center shadow-lg`}>
              <svg className="w-3.5 h-3.5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          
          {/* Orbiting dots - CSS only */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s", animationDelay: "-1s" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s", animationDelay: "-2s" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
          </div>
        </div>
      </div>
    );
  }

  // Pending state
  return (
    <div className="flex items-center justify-center px-1 pt-8">
      <div className="relative w-10 h-10">
        <svg className="w-full h-full text-slate-300 dark:text-slate-600" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
      </div>
    </div>
  );
}

export function PipelineProgress({ status, onViewCampaignStatus }: PipelineProgressProps) {
  const phases: PipelinePhase[] = ["discovery", "research", "composition"];
  const summaryRef = useRef<HTMLDivElement>(null);

  const isMultiDay = status.is_multi_day && (status.duration_days ?? 1) > 1;

  const getHeaderContent = () => {
    if (status.status === "completed") {
      return (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center animate-pulse">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-30 blur-md animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {isMultiDay ? `Day ${status.current_day} Complete!` : "Pipeline Complete!"}
            </h2>
            <p className="text-slate-500 text-sm">
              {isMultiDay 
                ? `Day ${status.current_day} of ${status.duration_days} finished successfully` 
                : "All tasks finished successfully"}
            </p>
          </div>
        </div>
      );
    }

    if (status.status === "failed") {
      return (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-red-600">Pipeline Failed</h2>
            <p className="text-slate-500 text-sm">An error occurred during processing</p>
          </div>
        </div>
      );
    }

    const currentConfig = phaseConfig[status.phase];
    return (
      <div className="flex items-center gap-3">
        <div className={`relative w-12 h-12 rounded-full bg-gradient-to-r ${currentConfig.gradient} flex items-center justify-center text-white`}>
          {currentConfig.icon}
          <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${currentConfig.gradient} opacity-30 blur-md animate-pulse`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Pipeline Running
          </h2>
          <p className={`text-sm font-medium bg-gradient-to-r ${currentConfig.gradient} bg-clip-text text-transparent`}>
            {currentConfig.label}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        
        <CardHeader className="relative border-b border-slate-100 dark:border-slate-800 pb-6">
          <CardTitle className="flex items-center justify-between">
            {getHeaderContent()}
            
            {/* Live indicator */}
            {status.status !== "completed" && status.status !== "failed" && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Live</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative pt-8 pb-6 space-y-6">
          {/* Phase Progress Cards */}
          <div className="flex items-start justify-between gap-4">
            {phases.map((phase, index) => {
              const phaseProgress = status.progress[phase];
              const config = phaseConfig[phase];
              const percent = phaseProgress.total > 0
                ? Math.round((phaseProgress.completed / phaseProgress.total) * 100)
                : 0;
              const isActive = phaseProgress.status === "in_progress";

              return (
                <div key={phase} className="flex-1 flex items-start">
                  {/* Phase Card */}
                  <div className={`phase-card relative flex-1 p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isActive 
                      ? `border-transparent bg-gradient-to-br ${config.bgGradient} shadow-lg` 
                      : phaseProgress.status === "completed"
                        ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20"
                        : phaseProgress.status === "failed"
                          ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  }`}>
                    
                    {/* Status icon */}
                    <div className="flex items-center justify-between mb-3">
                      {statusIcons[phaseProgress.status]}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        isActive 
                          ? `bg-gradient-to-r ${config.gradient} text-white`
                          : phaseProgress.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                            : phaseProgress.status === "failed"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                      }`}>
                        {phaseProgress.status === "in_progress" ? "In Progress" : 
                         phaseProgress.status === "completed" ? "Complete" :
                         phaseProgress.status === "failed" ? "Failed" : "Pending"}
                      </span>
                    </div>

                    {/* Phase icon and label */}
                    <div className={`mb-4 ${isActive ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                        isActive 
                          ? `bg-white/20` 
                          : phaseProgress.status === "completed"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                            : "bg-slate-100 dark:bg-slate-700"
                      }`}>
                        {config.icon}
                      </div>
                      <h4 className="font-semibold text-sm">{config.label}</h4>
                    </div>

                    {/* Progress stats */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className={isActive ? "text-white/80" : "text-slate-500"}>Progress</span>
                        <span className={`font-bold ${isActive ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>
                          {phaseProgress.completed} / {phaseProgress.total}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            phaseProgress.status === "completed"
                              ? "bg-gradient-to-r from-green-400 to-emerald-500"
                              : phaseProgress.status === "failed"
                                ? "bg-gradient-to-r from-red-400 to-rose-500"
                                : `bg-gradient-to-r ${config.gradient}`
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Percentage */}
                      <div className="text-right">
                        <span className={`text-lg font-bold ${isActive ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>
                          {percent}%
                        </span>
                      </div>

                      {/* Failed count */}
                      {phaseProgress.failed > 0 && (
                        <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                          </svg>
                          {phaseProgress.failed} failed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Circular Processing Connector */}
                  {index < phases.length - 1 && (
                    <ProcessingConnector
                      isActive={phaseProgress.status === "completed" && status.progress[phases[index + 1]].status === "in_progress"}
                      isCompleted={status.progress[phases[index + 1]].status === "completed" || status.progress[phases[index + 1]].status === "in_progress"}
                      fromGradient={config.gradient}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Phase Animation Panel */}
          {status.status !== "completed" && status.status !== "failed" && (
            <div className="activity-panel relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-violet-200/30 to-purple-200/30 dark:from-violet-800/20 dark:to-purple-800/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 dark:from-cyan-800/20 dark:to-blue-800/20 rounded-full blur-3xl" />
              </div>
              
              <div className="relative flex items-center gap-6 p-6">
                {/* Lottie Animation */}
                <div className="flex-shrink-0 w-32 h-32 relative">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${phaseConfig[status.phase].bgGradient} animate-pulse`} />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Lottie
                      animationData={phaseAnimations[status.phase]}
                      loop={true}
                      style={{ width: 120, height: 120 }}
                    />
                  </div>
                </div>

                {/* Activity Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${phaseConfig[status.phase].gradient} animate-pulse`} />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Currently Processing
                    </span>
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 bg-gradient-to-r ${phaseConfig[status.phase].gradient} bg-clip-text text-transparent`}>
                    {phaseConfig[status.phase].label}
                  </h3>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {status.phase === "discovery" && "Scanning databases and finding contacts that match your criteria..."}
                    {status.phase === "research" && "Analyzing company data, news, and signals to build context..."}
                    {status.phase === "composition" && "Crafting personalized email sequences for each contact..."}
                  </p>

                  {/* Mini progress for current phase */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        {status.progress[status.phase].completed} of {status.progress[status.phase].total} items processed
                      </span>
                      <span className={`font-bold bg-gradient-to-r ${phaseConfig[status.phase].gradient} bg-clip-text text-transparent`}>
                        {status.progress[status.phase].total > 0 
                          ? Math.round((status.progress[status.phase].completed / status.progress[status.phase].total) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${phaseConfig[status.phase].gradient} transition-all duration-500`}
                        style={{ 
                          width: `${status.progress[status.phase].total > 0 
                            ? (status.progress[status.phase].completed / status.progress[status.phase].total) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="hidden lg:flex flex-col gap-3 items-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${phaseConfig[status.phase].bgGradient} flex items-center justify-center`}>
                    <div className="text-2xl">
                      {status.phase === "discovery" && "🔍"}
                      {status.phase === "research" && "💡"}
                      {status.phase === "composition" && "✉️"}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${phaseConfig[status.phase].gradient} animate-bounce`} style={{ animationDelay: "0ms" }} />
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${phaseConfig[status.phase].gradient} animate-bounce`} style={{ animationDelay: "150ms" }} />
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${phaseConfig[status.phase].gradient} animate-bounce`} style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Animation when complete */}
          {status.status === "completed" && !status.summary && (
            <div className="flex items-center justify-center py-8">
              <div className="w-40 h-40">
                <Lottie
                  animationData={successAnimation}
                  loop={false}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {status.error && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">Error Details</p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">{status.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Summary when complete */}
          {status.summary && (
            <div 
              ref={summaryRef}
              className="relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-800/30 dark:to-emerald-800/30 rounded-full blur-2xl" />
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/30 dark:to-teal-800/30 rounded-full blur-xl" />
              
              {/* Success Animation */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 opacity-30">
                <Lottie
                  animationData={successAnimation}
                  loop={true}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Pipeline Summary
                  </h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Contacts Discovered", value: status.summary.contacts_discovered, icon: "🔍" },
                    { label: "Contacts Researched", value: status.summary.contacts_researched, icon: "🔬" },
                    { label: "Sequences Created", value: status.summary.sequences_created, icon: "📧" },
                    { label: "Emails Scheduled", value: status.summary.total_emails_scheduled, icon: "📤" },
                  ].map((stat) => (
                    <div 
                      key={stat.label}
                      className="p-4 bg-white/70 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm border border-green-100 dark:border-green-800/50"
                    >
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {status.campaign_id && (
                  <div className="mt-6">
                    <Link href={`/campaigns/${status.campaign_id}`}>
                      <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        View Campaign Details & Analytics
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Multi-day campaign next run info */}
          {isMultiDay && status.status === "completed" && status.next_run_at && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Day {(status.current_day ?? 0) + 1} of {status.duration_days} scheduled
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Next run: {new Date(status.next_run_at).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                {status.total_credits_reserved && (
                  <div className="text-right">
                    <p className="text-xs text-blue-600 dark:text-blue-400">Credits</p>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {status.credits_consumed ?? 0} / {status.total_credits_reserved}
                    </p>
                  </div>
                )}
              </div>
              {onViewCampaignStatus && (
                <button
                  onClick={onViewCampaignStatus}
                  className="mt-3 w-full px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                >
                  View Campaign Status & Controls
                </button>
              )}
            </div>
          )}

          {/* Link to campaign while in progress */}
          {status.status !== "completed" && status.campaign_id && (
            <div className="text-center pt-2">
              <Link
                href={`/campaigns/${status.campaign_id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                View campaign progress
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
