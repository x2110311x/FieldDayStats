import { describe, it, expect, beforeEach } from 'vitest';
import { getCookie, setCookie } from '../utils/cookieUtils';

describe('cookieUtils', () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
    });
  });

  it('should return null when cookie does not exist', () => {
    expect(getCookie('test_cookie')).toBeNull();
  });

  it('should set and retrieve a cookie', () => {
    setCookie('test_cookie', 'test_value', 1);
    expect(getCookie('test_cookie')).toBe('test_value');
  });

  it('should overwrite an existing cookie', () => {
    setCookie('test_cookie', 'initial', 1);
    setCookie('test_cookie', 'updated', 1);
    expect(getCookie('test_cookie')).toBe('updated');
  });
});
