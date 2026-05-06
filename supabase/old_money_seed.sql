-- Initialization SQL for Old-Money Redesign site_settings
-- Run this in your Supabase SQL Editor to sync the frontend with the database.

INSERT INTO site_settings (key, value, description) VALUES
('site_logo_text', 'Evently', 'Main brand logo text'),
('hero_headline_part1', 'Curate Your', 'First part of the hero headline'),
('hero_headline_part2', 'Legacy.', 'Second part of the hero headline (styled italic)'),
('hero_bg_url', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'Hero background image URL'),
('hero_search_loc_placeholder', 'Where is your event?', 'Search bar location placeholder'),
('hero_search_type_placeholder', 'Event Type', 'Search bar event type placeholder'),
('grow_section_label', 'Philosophy', 'Small label above Digital Estate section'),
('grow_section_title', 'The Digital Estate', 'Main title for the features section'),
('grow_section_subtitle', 'We transcend the standard directory; Evently is a curated sanctuary where excellence and talent intersect.', 'Subtitle for the features section'),
('why_us_label', 'The Standard', 'Small label above Why Best Choose section'),
('why_us_title', 'Why the Best Choose Evently', 'Main title for the benefits section'),
('why_us_subtitle', 'We’ve re-imagined the architectural foundation of the event planning industry.', 'Subtitle for the benefits section'),
('planners_label', 'Planners', 'Small label above Master Planners section'),
('planners_title', 'The Master Planners', 'Main title for the planner carousel'),
('portfolio_label', 'Portfolio', 'Small label above Portfolio grid'),
('portfolio_title', 'Notable Heritage Moments', 'Main title for the events grid'),
('visionaries_title', 'For the Visionaries', 'Title for the planner CTA section'),
('visionaries_subtitle', 'Are you an architect of memories? Showcase your portfolio to the world''s most discerning guests.', 'Subtitle for the planner CTA section'),
('footer_tagline', 'Curating excellence in the world''s most prestigious event planning circles.', 'Brand tagline in footer'),
('footer_newsletter_description', 'Join our legacy network for exclusive insights.', 'Newsletter signup text')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();
