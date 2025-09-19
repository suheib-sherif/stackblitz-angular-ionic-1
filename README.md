# 📖 Overview

This project implements the Invest and Discover pages from the provided Figma designs using Angular + Ionic. The focus is design fidelity, component reusability, and realistic API/data modeling.
It also includes the Buy Order animation sequence as shown in the “Order form prototype” in the Figma file.

# 🚀 Implemented Features

Ionic Tabs Layout (Invest & Discover)

## Reusable Components

CardComponent – three size variants (lg, md, sm)
InstrumentComponent – owned / not-owned instruments with aligned layout
TypeChipComponent – stock/ETF chip with dynamic color
OrderFormComponent – sheet modal with swipe-to-buy interaction

## Pages

InvestPage – displays total equity, holdings list, and trending stocks
DiscoverPage – list of discoverable stocks with search functionality

## Animation

Swipe-to-buy animation sequence implemented with pointer events, progress fill, and completion callback

## Styling

Tailwind CSS + Ionic variables for design precision (spacing, typography, rounded corners)
Responsive layouts with horizontal scroll for cards

# 🎯 Design Assumptions

- Typography: Mapped Figma font sizes/weights to Tailwind utilities (Used Open Sans as alternative to Universal Sans [no free version]).
- Colors: Used Figma hex values when specified. Where missing, assumed Ionic’s neutral gray/black.
- Spacing & Layout: All paddings/margins translated from Figma px values to Tailwind equivalents (p-4, gap-3, etc.).
- Chips: Stock/ETF chips use border + text color provided via input.
- Order Modal: Implemented as Ionic sheet modal with inset margins (to match Figma “floating” card look).
- Search: Cancel button styled via ::part(cancel-button) selector; assumed show-cancel-button="focus" behavior.
- Interaction: Swipe-to-buy is required to complete purchase; simple click is not enough.
- Discover Page: I assumed Top 3 volume stock is meant to be similar to Trending Stocks on Invest page where we use the large card that can be scrolled horizontally (Figma shows one stock only in the Top 3 section).
- Discover Page: I assumed max 3 search history items.

# 🧩 Component Architecture

## CardComponent

Inputs: size, logo, ticker, name, price, type, metrics
Renders three responsive variants
Reusable in Discover + Trending sections

## InstrumentComponent

Inputs: mode, ticker, quantity / description, price, delta
Mode = owned → shows quantity, price, and change chip
Mode = not-owned → shows description and price only
Designed with display: contents so its parts align with column headers

## TypeChipComponent

Inputs: text, color, size
Tailwind-based chip replacement for <ion-chip>
Border + text color dynamic

## OrderFormComponent

Props: ticker, price, amount, shares
Swipe-to-buy implemented with pointer events
Emits event when swipe is completed
Displayed inside <ion-modal> with bottom sheet styling
