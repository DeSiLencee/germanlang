import './globals.css';import './helpers.css';import type {Metadata,Viewport} from 'next';import {Sidebar} from '@/components/Sidebar';import {Header} from '@/components/Header';import {AuthProvider} from '@/lib/auth';
export const metadata:Metadata={title:'Deutschwerk — Practical German',description:'Practical German for life and work'};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="de"><body><AuthProvider><div className="app"><Sidebar/><main><Header/>{children}</main></div></AuthProvider></body></html>}
