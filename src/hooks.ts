import type { Reroute } from '@sveltejs/kit';

// Reroute /index.html to / for Chrome extension compatibility
export const reroute: Reroute = ({ url }) => {
    if (url.pathname === '/index.html' || url.pathname.endsWith('/index.html')) {
        return '/';
    }
    return url.pathname;
};
