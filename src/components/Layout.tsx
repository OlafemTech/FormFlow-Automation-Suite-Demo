import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { FiHome, FiUpload, FiList, FiActivity, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'FormFlow Automation Suite' }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Check if user is authenticated
  React.useEffect(() => {
    if (!session && !router.pathname.startsWith('/auth')) {
      router.push('/auth/signin');
    }
  }, [session, router]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'Upload Form', href: '/upload', icon: FiUpload },
    { name: 'Submissions', href: '/submissions', icon: FiList },
    { name: 'Logs', href: '/logs', icon: FiActivity },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  if (!session && !router.pathname.startsWith('/auth')) {
    return null; // Don't render anything while redirecting to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content="FormFlow Automation Suite for PDF form processing and submission" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 flex">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75" 
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            ></div>
            
            {/* Sidebar */}
            <div className="relative flex flex-col flex-1 w-full max-w-xs bg-white">
              <div className="absolute top-0 right-0 pt-2 -mr-12">
                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <FiX className="w-6 h-6 text-white" />
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <h1 className="text-xl font-bold text-primary-600">FormFlow</h1>
                </div>
                <nav className="px-2 mt-5 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive(item.href)
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-4 flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              
              {session && (
                <div className="flex flex-shrink-0 p-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <div>
                      <div className="text-base font-medium text-gray-700">
                        {session.user?.name}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {session.user?.email}
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-1 ml-auto text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <span className="sr-only">Sign out</span>
                      <FiLogOut className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-white shadow-sm">
            <button
              type="button"
              className="p-2 -ml-2 text-gray-400 rounded-md lg:hidden hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <FiMenu className="w-6 h-6" aria-hidden="true" />
            </button>
            <h1 className="text-xl font-bold text-primary-600">FormFlow</h1>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex items-center flex-shrink-0 px-6 py-4">
          <h1 className="text-2xl font-bold text-primary-600">FormFlow</h1>
        </div>
        
        <div className="flex flex-col flex-1 h-0 overflow-y-auto">
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
              >
                <item.icon
                  className={`${
                    isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-5 w-5`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {session && (
            <div className="flex flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex items-center w-full">
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </div>
                  <div className="text-xs font-medium text-gray-500">
                    {session.user?.email}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-1 ml-auto text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <span className="sr-only">Sign out</span>
                  <FiLogOut className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
