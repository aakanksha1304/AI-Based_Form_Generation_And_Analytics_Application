import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserData, logout, isAuthenticated } from '../utils/auth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu } from 'lucide-react';

const Navigation = ({ mode, handleModeSwitch, handleGetStarted }) => {
  const userData = getUserData();
  const authenticated = isAuthenticated();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <nav className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 shadow-lg">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
              <span className="text-base font-bold text-white">AF</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              Artistic Forms
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-2">
          <Link 
            to="/create-form"
            className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-200"
          >
            Create Form
          </Link>
          {authenticated && (
            <Link 
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all duration-200"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher for Form Builder */}
          {mode && (
            <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1">
              <button
                onClick={() => handleModeSwitch('builder')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'builder' 
                    ? 'bg-white text-gray-900 shadow-md' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Builder
              </button>
              <button
                onClick={() => handleModeSwitch('preview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'preview' 
                    ? 'bg-white text-gray-900 shadow-md' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Preview
              </button>
            </div>
          )}

          {authenticated ? (
            <>
              {/* User Greeting */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-white">
                  Hi, {userData?.name || 'User'}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Get Started Button */}
              {handleGetStarted && (
                <button
                  onClick={handleGetStarted}
                  className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-gray-900 bg-white hover:bg-white/90 shadow-lg transition-all duration-200"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Login Link */}
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
              >
                Login
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navigation;

/* ============================================
   COMMENTED OUT: NEOBRUTALISM NAVBAR
   ============================================

const Navigation = ({ mode, handleModeSwitch, handleGetStarted }) => {
  const userData = getUserData();
  const authenticated = isAuthenticated();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <nav className="flex w-full max-w-4xl items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background px-4 py-3 shadow-shadow backdrop-blur-sm">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-base bg-main text-main-foreground border-2 border-border">
              <span className="text-sm font-heading">AF</span>
            </div>
            <span className="text-lg font-heading text-main-foreground hidden sm:block">
              Artistic Forms
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button
            asChild
            variant="neutral"
            size="sm"
          >
            <Link to="/create-form">
              Create Form
            </Link>
          </Button>
          {authenticated && (
            <Button
              asChild
              variant="neutral"
              size="sm"
            >
              <Link to="/dashboard">
                Dashboard
              </Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mode && (
            <div className="flex items-center bg-main border-2 border-border rounded-base p-1">
              <Button
                onClick={() => handleModeSwitch('builder')}
                variant={mode === 'builder' ? 'default' : 'neutral'}
                size="sm"
                className={mode === 'builder' ? 'shadow-none' : ''}
              >
                Builder
              </Button>
              <Button
                onClick={() => handleModeSwitch('preview')}
                variant={mode === 'preview' ? 'default' : 'neutral'}
                size="sm"
                className={mode === 'preview' ? 'shadow-none' : ''}
              >
                Preview
              </Button>
            </div>
          )}

          {authenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-main border-2 border-border rounded-base">
                <div className="w-6 h-6 bg-secondary-background border-2 border-border rounded-base flex items-center justify-center">
                  <span className="text-xs font-heading text-main-foreground">
                    {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-base text-main-foreground">
                  Hi, {userData?.name || 'User'}
                </span>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="neutral"
                size="sm"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              {handleGetStarted && (
                <Button
                  onClick={handleGetStarted}
                  variant="default"
                  size="sm"
                  className="hidden sm:flex"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              <Button
                asChild
                variant="neutral"
                size="sm"
              >
                <Link to="/login">
                  Login
                </Link>
              </Button>
            </>
          )}

          <Button
            variant="neutral"
            size="icon"
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </nav>
    </div>
  );
};

============================================ */