import toggleDirective from './toggle'
import { mount, createLocalVue as CreateLocalVue } from '@vue/test-utils'

// Emitted control event for collapse (emitted to collapse)
const EVENT_TOGGLE = 'bv::toggle::collapse'

// Listen to event for toggle state update (emitted by collapse)
const EVENT_STATE = 'bv::collapse::state'

describe('v-b-toggle directive', () => {
  it('works on buttons', async () => {
    const localVue = new CreateLocalVue()
    const spy = jest.fn()

    const App = localVue.extend({
      directives: {
        bToggle: toggleDirective
      },
      data() {
        return {}
      },
      mounted() {
        this.$root.$on(EVENT_TOGGLE, spy)
      },
      beforeDestroy() {
        this.$root.$off(EVENT_TOGGLE, spy)
      },
      template: '<button v-b-toggle.test>button</button>'
    })

    const wrapper = mount(App, {
      localVue: localVue
    })

    expect(wrapper.isVueInstance()).toBe(true)
    expect(wrapper.is('button')).toBe(true)
    expect(wrapper.find('button').attributes('aria-controls')).toBe('test')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('button').classes()).not.toContain('collapsed')
    expect(spy).not.toHaveBeenCalled()

    const $button = wrapper.find('button')
    $button.trigger('click')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith('test')
    expect(wrapper.find('button').attributes('aria-controls')).toBe('test')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('button').classes()).not.toContain('collapsed')

    wrapper.destroy()
  })

  it('works on non-buttons', async () => {
    const localVue = new CreateLocalVue()
    const spy = jest.fn()

    const App = localVue.extend({
      directives: {
        bToggle: toggleDirective
      },
      data() {
        return {
          text: 'span'
        }
      },
      mounted() {
        this.$root.$on(EVENT_TOGGLE, spy)
      },
      beforeDestroy() {
        this.$root.$off(EVENT_TOGGLE, spy)
      },
      template: '<span tabindex="0" v-b-toggle.test>{{ text }}</span>'
    })

    const wrapper = mount(App, {
      localVue: localVue
    })

    expect(wrapper.isVueInstance()).toBe(true)
    expect(wrapper.is('span')).toBe(true)
    expect(spy).not.toHaveBeenCalled()
    expect(wrapper.find('span').attributes('role')).toBe('button')
    expect(wrapper.find('span').attributes('aria-controls')).toBe('test')
    expect(wrapper.find('span').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('span').classes()).not.toContain('collapsed')
    expect(wrapper.find('span').text()).toBe('span')

    const $span = wrapper.find('span')
    $span.trigger('click')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toBeCalledWith('test')
    expect(wrapper.find('span').attributes('role')).toBe('button')
    expect(wrapper.find('span').attributes('aria-controls')).toBe('test')
    expect(wrapper.find('span').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('span').classes()).not.toContain('collapsed')

    // Test updating component. should maintain role attribute
    wrapper.setData({
      text: 'foobar'
    })
    expect(wrapper.find('span').text()).toBe('foobar')
    expect(wrapper.find('span').attributes('role')).toBe('button')
    expect(wrapper.find('span').attributes('aria-controls')).toBe('test')
    expect(wrapper.find('span').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('span').classes()).not.toContain('collapsed')

    wrapper.destroy()
  })
  it('responds to state update events', async () => {
    const localVue = new CreateLocalVue()

    const App = localVue.extend({
      directives: {
        bToggle: toggleDirective
      },
      data() {
        return {}
      },
      template: '<button v-b-toggle.test>button</button>'
    })

    const wrapper = mount(App, {
      localVue: localVue
    })

    expect(wrapper.isVueInstance()).toBe(true)
    expect(wrapper.is('button')).toBe(true)
    expect(wrapper.find('button').attributes('aria-controls')).toBe('test')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('button').classes()).not.toContain('collapsed')

    const $root = wrapper.vm.$root

    $root.$emit(EVENT_STATE, 'test', true)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('button').attributes('aria-controls')).toBe('test')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('button').classes()).not.toContain('collapsed')

    $root.$emit(EVENT_STATE, 'test', false)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('button').attributes('aria-controls')).toBe('test')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('button').classes()).toContain('collapsed')

    wrapper.destroy()
  })
})
