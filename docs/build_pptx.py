import os
import sys
from io import BytesIO
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# 1. Colors & Constants (Deck Restoration Plus Executive Palette)
NAVY_BRAND = RGBColor(30, 58, 99)       # #1E3A63
NAVY_DARK = RGBColor(15, 23, 42)        # #0F172A
NAVY_LIGHT = RGBColor(43, 82, 138)      # #2B528A
AMBER_BRAND = RGBColor(224, 129, 49)    # #E08131
AMBER_LIGHT = RGBColor(254, 243, 199)   # #FEF3C7
WHITE = RGBColor(255, 255, 255)
BG_LIGHT = RGBColor(248, 250, 252)      # #F8FAFC
CARD_BG = RGBColor(255, 255, 255)
CARD_BORDER = RGBColor(226, 232, 240)   # #E2E8F0
SLATE_TEXT = RGBColor(51, 65, 85)       # #334155
SLATE_MUTED = RGBColor(100, 116, 139)   # #64748B
RED_LIGHT = RGBColor(254, 242, 242)     # #FEF2F2
RED_BORDER = RGBColor(254, 202, 202)    # #FECACA
RED_TEXT = RGBColor(185, 28, 28)        # #B91C1C
GREEN_LIGHT = RGBColor(240, 253, 244)   # #F0FDF4
GREEN_TEXT = RGBColor(21, 128, 61)      # #15803D
BLUE_LIGHT = RGBColor(239, 246, 255)    # #EFF6FF
BLUE_BORDER = RGBColor(191, 219, 254)   # #BFDBFE

FONT_HEADING = 'Arial'
FONT_BODY = 'Calibri'

def convert_to_png(img_path):
    """Converts webp or other image formats to PNG in-memory for pptx compatibility."""
    if not os.path.exists(img_path):
        return None
    im = Image.open(img_path)
    buf = BytesIO()
    im.save(buf, format='PNG')
    buf.seek(0)
    return buf

def create_presentation():
    prs = Presentation()
    # 16:9 widescreen dimensions (13.333 x 7.5 inches)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    logo_path = os.path.join(base_dir, 'frontend', 'src', 'assets', 'images', 'MainLodo.png')
    deck_img_path = os.path.join(base_dir, 'frontend', 'src', 'assets', 'images', 'Round Wooden Deck with Wicker Seating.webp')
    hero_wood_path = os.path.join(base_dir, 'frontend', 'src', 'assets', 'images', 'deck_banner_wood.webp')

    # Helper: Set slide background color
    def set_background(slide, color):
        bg = slide.background
        fill = bg.fill
        fill.solid()
        fill.fore_color.rgb = color

    # Helper: Add Standard Slide Header
    def add_header(slide, badge_text, title_text, subtitle_text, slide_num):
        # Badge
        badge_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.5), Inches(2.8), Inches(0.35))
        badge_box.fill.solid()
        badge_box.fill.fore_color.rgb = BLUE_LIGHT
        badge_box.line.color.rgb = BLUE_BORDER
        badge_box.line.width = Pt(1)
        tf = badge_box.text_frame
        tf.word_wrap = True
        tf.margin_top = tf.margin_bottom = tf.margin_left = tf.margin_right = 0
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        p.text = badge_text.upper()
        p.font.name = FONT_HEADING
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = NAVY_BRAND

        # Title
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(10.0), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = FONT_HEADING
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = NAVY_BRAND

        # Subtitle
        tb_sub = slide.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(10.0), Inches(0.4))
        tf_sub = tb_sub.text_frame
        p_sub = tf_sub.paragraphs[0]
        p_sub.text = subtitle_text
        p_sub.font.name = FONT_BODY
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = SLATE_MUTED

        # Slide Number Badge
        num_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(11.2), Inches(0.6), Inches(1.3), Inches(0.45))
        num_box.fill.solid()
        num_box.fill.fore_color.rgb = AMBER_LIGHT
        num_box.line.color.rgb = AMBER_BRAND
        num_box.line.width = Pt(1)
        tf_num = num_box.text_frame
        p_num = tf_num.paragraphs[0]
        p_num.alignment = PP_ALIGN.CENTER
        p_num.text = f"{slide_num:02d} / 10"
        p_num.font.name = FONT_HEADING
        p_num.font.size = Pt(12)
        p_num.font.bold = True
        p_num.font.color.rgb = AMBER_BRAND

    # Helper: Add Styled Card
    def add_card(slide, left, top, width, height, title, desc, bullets=None, bg_color=CARD_BG, border_color=CARD_BORDER, title_color=NAVY_BRAND):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.2)
        
        tf = card.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.TOP
        tf.margin_top = Inches(0.2)
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.25)
        tf.margin_bottom = Inches(0.2)

        # Title
        p0 = tf.paragraphs[0]
        p0.text = title
        p0.font.name = FONT_HEADING
        p0.font.size = Pt(14)
        p0.font.bold = True
        p0.font.color.rgb = title_color
        p0.space_after = Pt(6)

        # Description
        if desc:
            p_desc = tf.add_paragraph()
            p_desc.text = desc
            p_desc.font.name = FONT_BODY
            p_desc.font.size = Pt(11)
            p_desc.font.color.rgb = SLATE_TEXT
            p_desc.space_after = Pt(8)

        # Bullets
        if bullets:
            for b in bullets:
                p_b = tf.add_paragraph()
                p_b.text = f"•  {b}"
                p_b.font.name = FONT_BODY
                p_b.font.size = Pt(10.5)
                p_b.font.color.rgb = SLATE_TEXT
                p_b.space_after = Pt(4)
        return card

    # ==========================================
    # SLIDE 1: COVER & EXECUTIVE VISION
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_background(s1, NAVY_BRAND)

    # Top Logo
    logo_buf = convert_to_png(logo_path)
    if logo_buf:
        # Add white container behind logo
        logo_bg = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.7), Inches(2.6), Inches(0.8))
        logo_bg.fill.solid()
        logo_bg.fill.fore_color.rgb = WHITE
        logo_bg.line.fill.background()
        s1.shapes.add_picture(logo_buf, Inches(0.9), Inches(0.75), width=Inches(2.4))

    # Badge
    b1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(4.5), Inches(0.35))
    b1.fill.solid()
    b1.fill.fore_color.rgb = RGBColor(39, 74, 124)
    b1.line.color.rgb = AMBER_BRAND
    p = b1.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    p.text = "DECK RESTORATION PLUS • COMMERCIAL & RESIDENTIAL"
    p.font.name = FONT_HEADING
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = AMBER_LIGHT

    # Main Title
    tb = s1.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(11.5), Inches(1.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "The Complete Multi-Portal\nDeck Estimating Ecosystem"
    p.font.name = FONT_HEADING
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = WHITE

    # Subtitle
    tb_sub = s1.shapes.add_textbox(Inches(0.8), Inches(3.9), Inches(11.0), Inches(0.9))
    tf_sub = tb_sub.text_frame
    tf_sub.word_wrap = True
    p = tf_sub.paragraphs[0]
    p.text = "An enterprise-grade operating system uniting Homeowners, Certified Contractors, and Master Administrators through instant algorithmic estimation, guaranteed pricing, and turnkey workflow management."
    p.font.name = FONT_BODY
    p.font.size = Pt(14)
    p.font.color.rgb = RGBColor(203, 213, 225)

    # 3 Portal Boxes at bottom
    portals = [
        ("1. Customer Portal", "Instant price calculation, photo condition analysis, realistic wood finishes, and turnkey PDF proposal generation."),
        ("2. Contractor Portal", "Verified lead marketplace, dynamic trade discounts, job acceptance pipelines, and commission tracking."),
        ("3. Master Admin Portal", "Dynamic pricing formula engines, user/contractor governance, product catalog sync, and business intelligence.")
    ]
    for i, (p_title, p_desc) in enumerate(portals):
        box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + i * 3.9), Inches(5.1), Inches(3.7), Inches(1.7))
        box.fill.solid()
        box.fill.fore_color.rgb = RGBColor(21, 41, 69)
        box.line.color.rgb = RGBColor(60, 95, 145)
        tf = box.text_frame
        tf.word_wrap = True
        tf.margin_top = Inches(0.18)
        tf.margin_left = Inches(0.2)
        tf.margin_right = Inches(0.2)
        p0 = tf.paragraphs[0]
        p0.text = p_title
        p0.font.name = FONT_HEADING
        p0.font.size = Pt(13)
        p0.font.bold = True
        p0.font.color.rgb = AMBER_BRAND
        p0.space_after = Pt(4)
        p1 = tf.add_paragraph()
        p1.text = p_desc
        p1.font.name = FONT_BODY
        p1.font.size = Pt(10.5)
        p1.font.color.rgb = RGBColor(226, 232, 240)

    # ==========================================
    # SLIDE 2: THE INDUSTRY CHALLENGE & SOLUTION
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_background(s2, BG_LIGHT)
    add_header(s2, "Market Transformation", "The Industry Problem vs. Our Automated Solution", "Eliminating friction, guesswork, and scheduling delays in outdoor living restoration", 2)

    add_card(s2, Inches(0.8), Inches(2.1), Inches(5.6), Inches(4.7), 
             "The Traditional Industry Bottleneck", 
             "Outdated manual estimating methods waste time, cause misquotes, and lose qualified homeowner interest:",
             [
                 "Slow 3 to 7-Day Turnaround: Homeowners wait days for a contractor to visit and hand-measure.",
                 "Arbitrary Handwritten Pricing: Inconsistent contractor quotes destroy consumer trust.",
                 "Contractor Driving Overhead: Tradesmen spend 40% of their week driving to measure unqualified bids.",
                 "No Product Standards: Inappropriate stain or chemical choices cause premature deck failures."
             ],
             bg_color=RED_LIGHT, border_color=RED_BORDER, title_color=RED_TEXT)

    add_card(s2, Inches(6.8), Inches(2.1), Inches(5.7), Inches(4.7), 
             "The Deck Estimator Pro Advantage", 
             "Algorithmic, verified accuracy that converts casual website visitors into signed restoration contracts:",
             [
                 "Under 60-Second Instant Estimates: Parametric calculation by sq ft, height, wood, & condition.",
                 "Certified Contractor Dispatch: Pre-screened, verified trade pros receive pre-priced actionable leads.",
                 "Turnkey Official PDF Proposals: Itemized breakdowns for labor, chemicals, primers, and sealers.",
                 "100% Mobile Optimized: Fluid single-thumb workflow designed for homeowner phones and field iPads."
             ],
             bg_color=BLUE_LIGHT, border_color=BLUE_BORDER, title_color=NAVY_BRAND)

    # ==========================================
    # SLIDE 3: PUBLIC LANDING & LEAD FUNNEL
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_background(s3, BG_LIGHT)
    add_header(s3, "Public Front-Door", "Landing Experience & High-Conversion Funnel", "Bridging national brand authority, homeowner education, and instant quotation discovery", 3)

    add_card(s3, Inches(0.8), Inches(2.1), Inches(6.0), Inches(1.4), 
             "✨ Wizard Authority & Trust Architecture", 
             "Anchored by the signature 'Deck Wizard' persona, establishing national authority with certified credentials, verified reviews, and guaranteed calculations.")

    add_card(s3, Inches(0.8), Inches(3.7), Inches(6.0), Inches(1.4), 
             "⚡ Instant Teaser Calculator", 
             "Homeowners test deck sizes, shapes, and material finishes with instant pricing previews right from the landing hero without high-pressure barriers.")

    add_card(s3, Inches(0.8), Inches(5.3), Inches(6.0), Inches(1.5), 
             "🎯 Dual Onboarding Pathway", 
             "Separate customized funnels for residential homeowners seeking quotes vs. commercial/licensed contractors seeking profitable job assignments.")

    # Image Showcase
    deck_buf = convert_to_png(deck_img_path)
    if deck_buf:
        img_card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.1), Inches(2.1), Inches(5.4), Inches(4.7))
        img_card.fill.solid()
        img_card.fill.fore_color.rgb = WHITE
        img_card.line.color.rgb = CARD_BORDER
        s3.shapes.add_picture(deck_buf, Inches(7.2), Inches(2.2), width=Inches(5.2), height=Inches(4.5))

    # ==========================================
    # SLIDE 4: CUSTOMER PORTAL - PRECISION ESTIMATOR
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_background(s4, BG_LIGHT)
    add_header(s4, "Customer Experience", "Customer Portal: The Precision Continuous Estimator", "Multi-parameter engineering calculation adapted to customer-friendly visual choices", 4)

    add_card(s4, Inches(0.8), Inches(2.1), Inches(3.6), Inches(4.7), 
             "1. Dimension & Geometry", 
             "Structural parameters captured accurately:",
             [
                 "Multiple Shapes: Rectangular, L-Shape, Multi-Level, and Custom geometries.",
                 "Elevation Multipliers: Ground level, Elevated (4-8 ft), and Second-Story multi-deck.",
                 "Railing & Steps: Linear foot calculations for railings, balusters, and stair risers.",
                 "Sub-structures: Underside sealing, fascia wraps, and structural post staging."
             ])

    add_card(s4, Inches(4.8), Inches(2.1), Inches(3.6), Inches(4.7), 
             "2. Substrate & Condition", 
             "Materials and wear diagnosis:",
             [
                 "Wood Species: Pressure-Treated Pine, Cedar, Redwood, Mahogany, Ipe, and Trex Composite.",
                 "Condition Grading: Bare/New, Good Condition, Moderately Weathered, Severely Weathered.",
                 "Service Tiers: Deep Cleaning, Sanding, Clear Sealing, Semi-Transparent, or Solid Stain.",
                 "Photo Uploads: Direct customer upload of deck photos for remote review."
             ], bg_color=BLUE_LIGHT, border_color=BLUE_BORDER)

    add_card(s4, Inches(8.8), Inches(2.1), Inches(3.7), Inches(4.7), 
             "3. Real-Time Math Engine", 
             "Instant transparent quote generation:",
             [
                 "Transparent Formulas: Automatic breakdown of square-foot labor and material costs.",
                 "Minimum Job Mobilization: Enforces $2,500 standard minimum to guarantee contractor profitability.",
                 "Dynamic Discounts: Promo code application and seasonal promotional rates.",
                 "Instant Save: Immediately registers project into the customer's personal dashboard."
             ], bg_color=AMBER_LIGHT, border_color=AMBER_BRAND)

    # ==========================================
    # SLIDE 5: CUSTOMER PORTAL - PROJECTS & PDF EXPORTS
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_background(s5, BG_LIGHT)
    add_header(s5, "Customer Hub", "Customer Portal: Dashboard, Projects & PDF Proposals", "Centralized self-service portal for managing estimates, status, and official documents", 5)

    add_card(s5, Inches(0.8), Inches(2.1), Inches(5.6), Inches(2.2), 
             "📊 2×2 KPI Metric Grid", 
             "Responsive metrics on desktop and mobile showing Total Estimates, Newly Created, Active In-Review, and Completed Restorations at a glance.")

    add_card(s5, Inches(6.8), Inches(2.1), Inches(5.7), Inches(2.2), 
             "📄 Turnkey PDF Proposal Export", 
             "One-click generation of official branded estimate documents complete with detailed scope items, labor breakdown, warranties, and terms of service.",
             bg_color=BLUE_LIGHT, border_color=BLUE_BORDER)

    add_card(s5, Inches(0.8), Inches(4.6), Inches(5.6), Inches(2.2), 
             "📱 Mobile-First Card View", 
             "Automatically transforms wide 7-column desktop tables into compact, readable mobile cards for seamless tracking on smartphones.")

    add_card(s5, Inches(6.8), Inches(4.6), Inches(5.7), Inches(2.2), 
             "🤝 Contractor Matching Pipeline", 
             "Homeowners can request their estimate be turned into an active job, instantly dispatching details to certified local contractor partners.",
             bg_color=AMBER_LIGHT, border_color=AMBER_BRAND)

    # ==========================================
    # SLIDE 6: CONTRACTOR PORTAL - VERIFICATION & PIPELINE
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_background(s6, BG_LIGHT)
    add_header(s6, "Contractor Network", "Contractor Portal: Verification & Verified Leads", "Empowering tradesmen with licensed credentialing and pre-qualified job assignments", 6)

    add_card(s6, Inches(0.8), Inches(2.1), Inches(3.6), Inches(4.7), 
             "1. Automated Verification", 
             "Rigorous trade credentialing:",
             [
                 "Document Desk: Secure upload of General Liability, Worker's Comp, & Trade Licenses.",
                 "Admin Audit Queue: Compliance verification before contractors can access live leads.",
                 "Profile Customization: Business address, dispatch radius, crew capacity, and phone.",
                 "Trust Badge: Verified contractors display official Deck Restoration Plus seal."
             ])

    add_card(s6, Inches(4.8), Inches(2.1), Inches(3.6), Inches(4.7), 
             "2. Real-Time Lead Hub", 
             "Actionable pre-priced opportunities:",
             [
                 "No Blind Bidding: Contractors view exact square footage, wood type, and calculated total.",
                 "One-Click Acceptance: Accept or reject customer estimate projects in real-time.",
                 "Customer Contact: Direct telephone and email outreach upon lead assignment.",
                 "Status Tracking: Lead status lifecycle from New → Contacted → Converted."
             ], bg_color=BLUE_LIGHT, border_color=BLUE_BORDER)

    add_card(s6, Inches(8.8), Inches(2.1), Inches(3.7), Inches(4.7), 
             "3. Job Milestones & Schedule", 
             "Operational execution tracking:",
             [
                 "Milestone Workflow: Step-by-step progress tracking from Site Prep to Final Staining.",
                 "Scope Verification: Field inspection check-off against customer-submitted photos.",
                 "Completion Signoff: Homeowner sign-off triggers automated payout verification.",
                 "Customer Reviews: High completion scores unlock priority lead dispatch."
             ], bg_color=GREEN_LIGHT, border_color=GREEN_TEXT)

    # ==========================================
    # SLIDE 7: CONTRACTOR PORTAL - COMMISSIONS & FINANCES
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_background(s7, BG_LIGHT)
    add_header(s7, "Financial Operations", "Contractor Portal: Discounts, Commissions & Earnings", "Clear financial visibility, trade discount tiering, and transparent payout tracking", 7)

    add_card(s7, Inches(0.8), Inches(2.1), Inches(6.0), Inches(1.4), 
             "💰 Dynamic Trade Discount Tiers", 
             "Contractors receive tiered material and chemical discounts (e.g. 10% Gold, 15% Platinum) applied automatically on Deck Restoration Plus professional products.",
             bg_color=BLUE_LIGHT, border_color=BLUE_BORDER)

    add_card(s7, Inches(0.8), Inches(3.7), Inches(6.0), Inches(1.4), 
             "📈 Transparent Commission Calculation", 
             "Automated commission splits calculated down to the cent upon project milestone verification, eliminating manual invoicing disputes.")

    add_card(s7, Inches(0.8), Inches(5.3), Inches(6.0), Inches(1.5), 
             "🧾 Financial Ledger & Export", 
             "Itemized payout history, pending balances, and tax-ready export records for accounting and QuickBooks synchronization.",
             bg_color=AMBER_LIGHT, border_color=AMBER_BRAND)

    # Right Big Stat Card
    stat_box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.2), Inches(2.1), Inches(5.3), Inches(4.7))
    stat_box.fill.solid()
    stat_box.fill.fore_color.rgb = NAVY_DARK
    stat_box.line.color.rgb = NAVY_LIGHT
    tf = stat_box.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(1.0)
    tf.margin_left = Inches(0.5)
    tf.margin_right = Inches(0.5)

    p0 = tf.paragraphs[0]
    p0.alignment = PP_ALIGN.CENTER
    p0.text = "100%"
    p0.font.name = FONT_HEADING
    p0.font.size = Pt(56)
    p0.font.bold = True
    p0.font.color.rgb = AMBER_BRAND

    p1 = tf.add_paragraph()
    p1.alignment = PP_ALIGN.CENTER
    p1.text = "Automated Accounting"
    p1.font.name = FONT_HEADING
    p1.font.size = Pt(18)
    p1.font.bold = True
    p1.font.color.rgb = WHITE
    p1.space_after = Pt(12)

    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    p2.text = "Eliminates contractor invoice delays, automates platform commission splits, protects profit margins, and provides real-time earning analytics for business growth."
    p2.font.name = FONT_BODY
    p2.font.size = Pt(12)
    p2.font.color.rgb = RGBColor(203, 213, 225)

    # ==========================================
    # SLIDE 8: MASTER ADMIN PORTAL - GOVERNANCE
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_background(s8, BG_LIGHT)
    add_header(s8, "Executive Control", "Master Admin Portal: Platform Oversight & Governance", "Total enterprise command center for users, contractors, system settings, and security", 8)

    add_card(s8, Inches(0.8), Inches(2.1), Inches(5.6), Inches(2.2), 
             "👥 Unified User Directory", 
             "Complete lifecycle management of Homeowners, Contractors, and Admins with activation toggles, password management, and activity histories.")

    add_card(s8, Inches(6.8), Inches(2.1), Inches(5.7), Inches(2.2), 
             "🛡️ Document Verification Desk", 
             "Admin review queue for contractor insurance certificates and trade licenses with single-click Approval, Rejection, or Request Info.",
             bg_color=BLUE_LIGHT, border_color=BLUE_BORDER)

    add_card(s8, Inches(0.8), Inches(4.6), Inches(5.6), Inches(2.2), 
             "⚙️ 35+ Dynamic Platform Settings", 
             "Zero-code live controls for company branding, support phone numbers, operating hours, dispatch radii, and legal terms.",
             bg_color=AMBER_LIGHT, border_color=AMBER_BRAND)

    add_card(s8, Inches(6.8), Inches(4.6), Inches(5.7), Inches(2.2), 
             "🔒 Lightweight Audit Trail", 
             "Tamper-evident activity logs capturing administrative changes, rate adjustments, and role updates with automatic binary payload sanitization.")

    # ==========================================
    # SLIDE 9: ADMIN DYNAMIC PRICING ENGINE & CATALOGS
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_background(s9, BG_LIGHT)
    add_header(s9, "Pricing Mathematics", "Admin Engine: Dynamic Formulas & Product Catalogs", "Complete control over cost algorithms, materials, chemical rates, and profit margins", 9)

    add_card(s9, Inches(0.8), Inches(2.1), Inches(3.6), Inches(4.7), 
             "1. Pricing Matrix Config", 
             "Formula parameter customization:",
             [
                 "Base Rate per Sq. Ft: Adjustable baseline for labor and basic preparation.",
                 "Height Multipliers: Ground level (1.0x), Elevated (1.2x), Second-story (1.45x).",
                 "Condition Escalators: Automated surcharge for heavy rot, peeling stain, or structural cracks.",
                 "Mobilization Minimum: Set floor price ($2,500) to protect project unit economics."
             ])

    add_card(s9, Inches(4.8), Inches(2.1), Inches(3.6), Inches(4.7), 
             "2. Material & Substrates", 
             "Substrate-specific engineering:",
             [
                 "Lumber Multipliers: Pine, Cedar, Redwood, Mahogany, Ipe, and Trex composite.",
                 "Railing Linear Costs: Custom rates for wood, cable wire, composite, & aluminum railings.",
                 "Stair & Risers: Per-step restoration pricing based on condition severity.",
                 "Catalog Management: Create, toggle active/inactive, and reorder substrate options."
             ], bg_color=BLUE_LIGHT, border_color=BLUE_BORDER)

    add_card(s9, Inches(8.8), Inches(2.1), Inches(3.7), Inches(4.7), 
             "3. Chemical Coverage Sync", 
             "Chemical and material inventory sync:",
             [
                 "Square Foot Coverage: Cleaner, brightener, and oil stain gallons required per sq.ft.",
                 "SKU Mapping: Direct link between calculated project needs and warehouse product SKUs.",
                 "Cost Sync: Automatic adjustment of contractor product costs upon catalog updates.",
                 "Margin Protection: Ensures contractor discounts never compromise platform gross margin."
             ], bg_color=AMBER_LIGHT, border_color=AMBER_BRAND)

    # ==========================================
    # SLIDE 10: STRATEGIC VALUE, AI ROADMAP & CONCLUSION
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_background(s10, BG_LIGHT)
    add_header(s10, "Future Vision", "Strategic Value, AI Roadmap & Future Outcomes", "Positioning Deck Estimator Pro as the definitive standard in outdoor living technology", 10)

    add_card(s10, Inches(0.8), Inches(2.1), Inches(5.6), Inches(4.7), 
             "🚀 Immediate Business Outcomes", 
             "Measurable enterprise benefits realized today:",
             [
                 "+300% Lead Velocity: Quotes generated instantly 24/7 without waiting for physical site visits.",
                 "Zero Estimate Math Errors: Universal formula enforcement eliminates under-quoted jobs.",
                 "Turnkey Contractor Buy-In: Verified contractors receive pre-priced, actionable customer jobs.",
                 "Rock-Solid Scalability: Clean MongoDB Atlas architecture with < 10MB core footprint.",
                 "Enhanced Close Rates: Instant PDF proposals capture customer interest at peak decision intent."
             ],
             bg_color=BLUE_LIGHT, border_color=BLUE_BORDER, title_color=NAVY_BRAND)

    add_card(s10, Inches(6.8), Inches(2.1), Inches(5.7), Inches(4.7), 
             "🔮 Future AI & Enterprise Roadmap", 
             "Next-generation technology expansion:",
             [
                 "Computer Vision Wood Analysis: Mobile camera scans deck boards to automatically detect rot, mildew, and square footage.",
                 "3D Augmented Reality (AR) Preview: Homeowners see exact stain colors and finishes overlaid on their real deck via camera.",
                 "Direct ERP & Warehouse Auto-Fulfillment: Auto-ordering chemical pallets from Deck Restoration Plus warehouse upon job signature.",
                 "Instant Contractor Payouts: Automated Stripe Connect disbursements on project milestone signoff."
             ],
             bg_color=AMBER_LIGHT, border_color=AMBER_BRAND, title_color=AMBER_BRAND)

    output_path = os.path.join(base_dir, 'docs', 'DeckEstimator_Executive_Presentation.pptx')
    prs.save(output_path)
    print(f"✔ Presentation generated successfully at: {output_path}")

if __name__ == '__main__':
    create_presentation()

