// src/components/__tests__/SkinSelector.test.jsx

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkinSelector from '../maingame/boxex/skinselector';
import { SettingsContext } from '../../pages/settings/properties';
import empty from '../../data/resized_box.png';
import some from '../../data/resized_box_some.png';
import half from '../../data/resized_box_half.png';
import full from '../../data/resized_box_full.png';

describe('SkinSelector Component', () => {
  const renderWithSkin = (skinstatus, props) =>
    render(
      <SettingsContext.Provider value={{ skinstatus }}>
        <SkinSelector {...props} />
      </SettingsContext.Provider>
    );

  it('renders CuteBoxSkin when new skin (skinstatus=false)', () => {
    renderWithSkin(false, {
      boxName: 'testBox',
      activeBox: 'testBox',
      boxes: { testBox: [1, 2, 3] },
    });
    // CuteBoxSkin renders its own markup: look for topBox image
    const topImg = screen.getByAltText('topBox');
    expect(topImg).toBeInTheDocument();
    // old skin image should not render
    expect(screen.queryByAltText('box')).toBeNull();
  });

  describe('old skin (skinstatus=true) image rendering', () => {
    const cases = [
      { count: 0, expected: empty },
      { count: 10, expected: some },
      { count: 30, expected: half },
      { count: 60, expected: full },
    ];

    cases.forEach(({ count, expected }) => {
      it(`shows src="${expected}" for ${count} words`, () => {
        renderWithSkin(true, {
          boxName: 'b',
          activeBox: 'b',
          boxes: { b: Array(count).fill(null) },
        });
        const img = screen.getByAltText('box');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', expected);
        expect(img).toHaveClass('active');
      });
    });

    it('applies notactive class when box is not active', () => {
      renderWithSkin(true, {
        boxName: 'b',
        activeBox: 'other',
        boxes: { b: Array(5).fill(null) },
      });
      const img = screen.getByAltText('box');
      expect(img).toHaveClass('notactive');
    });
  });
});
