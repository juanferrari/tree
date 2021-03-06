import React from 'react';
import { mount } from 'enzyme';
import Tree, { TreeNode } from '../src';
import MotionTreeNode from '../src/MotionTreeNode';
import { TreeContext } from '../src/contextTypes';
import { getMinimumRangeTransitionRange } from '../src/NodeList';

describe('Tree Motion', () => {
  it('basic', () => {
    const motion = {
      motionName: 'bamboo',
    };
    const wrapper = mount(
      <Tree motion={motion}>
        <TreeNode key="0-0">
          <TreeNode key="0-0-0" />
        </TreeNode>
      </Tree>,
    );

    const switcher = wrapper.find('.rc-tree-switcher');
    switcher.simulate('click');

    expect(wrapper.find('CSSMotion').props()).toMatchObject(motion);
  });

  it('hide item', done => {
    const wrapper = mount(
      <Tree
        treeData={[{ key: '0-0', children: [{ key: '0-0-0' }] }]}
        expandedKeys={['0-0']}
        motion={{}}
      />,
    );
    wrapper.setProps({ expandedKeys: [] });

    setTimeout(() => {
      wrapper.update();
      // Confirm CSSMotion is prepare to hide
      expect(wrapper.find('CSSMotion').props().visible).toBeFalsy();
      done();
    }, 100);
  });

  it('getMinimumRangeTransitionRange', () => {
    const visibleList = getMinimumRangeTransitionRange(
      new Array(100).fill(null).map((_, index) => index),
      100,
      20,
    );

    expect(visibleList.length < 10).toBeTruthy();
  });

  it('not crash', () => {
    const wrapper = mount(
      <Tree
        treeData={[{ key: '0-0', children: [{ key: '0-0-0' }] }]}
        expandedKeys={['0-0']}
        motion={{}}
      />,
    );

    wrapper.setProps({ treeData: [] });
  });

  it('should not expanded when in motion', () => {
    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(fn => window.setTimeout(fn, 16));
    jest.useFakeTimers();

    const onExpand = jest.fn();
    const wrapper = mount(
      <Tree
        onExpand={onExpand}
        motion={{
          motionName: 'bamboo',
          motionDeadline: 1000,
          motionAppear: true,
        }}
      >
        <TreeNode key="0-0">
          <TreeNode key="0-0-0" />
        </TreeNode>
      </Tree>,
    );

    function doExpand() {
      const switcher = wrapper.find('.rc-tree-switcher').first();
      switcher.simulate('click');
    }

    // First click should work
    doExpand();
    expect(onExpand).toHaveBeenCalled();
    onExpand.mockReset();

    // Not trigger when in motion
    doExpand();
    expect(onExpand).not.toHaveBeenCalled();

    raf.mockRestore();
    jest.useRealTimers();
  });

  it('MotionTreeNode should always trigger motion end', () => {
    const onMotionEnd = jest.fn();
    const wrapper = mount(
      <TreeContext.Provider value={{ prefixCls: 'test' }}>
        <MotionTreeNode motionNodes={[]} onMotionEnd={onMotionEnd} />
      </TreeContext.Provider>,
    );

    expect(onMotionEnd).not.toHaveBeenCalled();

    wrapper.unmount();
    expect(onMotionEnd).toHaveBeenCalled();
  });
});
