"use client";

import React, { FC } from "react";
import { Nav } from "./(components)/Nav";
import SectionUserBanner from "./SectionUserBanner";

export interface CommonLayoutProps {
    children?: React.ReactNode;
}

const CommonLayout: FC<CommonLayoutProps> = ({ children }) => {
    return (
        <div className="nc-CommonLayoutAccount bg-gray-50 dark:bg-neutral-900 min-h-screen">
            {/* User Banner Carousel */}
            <SectionUserBanner height="300px" className="mb-8" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <Nav />
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CommonLayout;

