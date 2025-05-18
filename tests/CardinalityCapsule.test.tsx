import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CardinalityCapsule } from '../src/ui/organisms/CardinalityCapsule';

describe('CardinalityCapsule', () => {
  it('calls onFocusAttr when mini-bar row activated via keyboard', () => {
    const onFocusAttr = vi.fn();
    render(
      <CardinalityCapsule
        seriesCount={10}
        baseSeriesCount={10}
        thresholdHigh={100}
        attrRank={['method']}
        attrUniq={{ method: 1 }}
        focusedAttrKey={null}
        onFocusAttr={onFocusAttr}
        onToggleDrop={vi.fn()}
        isDropSimActive={false}
        droppedKey={null}
      />
    );

    const row = screen.getByText('method').parentElement as HTMLElement;
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onFocusAttr).toHaveBeenCalledWith('method');
    onFocusAttr.mockClear();
    fireEvent.keyDown(row, { key: ' ' });
    expect(onFocusAttr).toHaveBeenCalledWith('method');
  });

  it('shows correct reduction percentage when drop simulation active', () => {
    render(
      <CardinalityCapsule
        seriesCount={60}
        baseSeriesCount={100}
        thresholdHigh={100}
        attrRank={['method']}
        attrUniq={{ method: 2 }}
        focusedAttrKey="method"
        onFocusAttr={vi.fn()}
        onToggleDrop={vi.fn()}
        isDropSimActive={true}
        droppedKey="method"
      />
    );

    // Find the simulation result using the data-testid
    const simulationResultDiv = screen.getByTestId('simulation-result');
    
    // Verify it exists and has the correct class
    expect(simulationResultDiv).toBeInTheDocument();
    expect(simulationResultDiv).toHaveClass('_simulationResult_34e5ba');
    
    // Verify it contains the correct information
    const resultText = simulationResultDiv.textContent;
    expect(resultText).toContain('60');
    expect(resultText).toContain('40%');
    expect(resultText).toContain('less');
  });
});

