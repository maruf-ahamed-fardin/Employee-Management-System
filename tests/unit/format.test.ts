import { getInitials, truncate } from '../../lib/utils/format';

describe('format utilities', () => {
  it('should generate initials correctly', () => {
    expect(getInitials('Ashek', 'Rabbani')).toBe('AR');
    expect(getInitials('Maruf', '')).toBe('M');
  });

  it('should truncate strings appropriately', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
    expect(truncate('Short', 10)).toBe('Short');
  });
});
