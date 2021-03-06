import React from 'react'
import { CrowdsaleStartTime } from '../../../src/components/Common/CrowdsaleStartTime'
import { Form } from 'react-final-form'
import Adapter from 'enzyme-adapter-react-15'
import { configure, mount } from 'enzyme'
import renderer from 'react-test-renderer'
import { VALIDATION_MESSAGES, TEXT_FIELDS, DESCRIPTION } from '../../../src/utils/constants'
import MockDate from 'mockdate'

configure({ adapter: new Adapter() })
const DECRIPTION = DESCRIPTION.START_TIME
const LABEL = TEXT_FIELDS.START_TIME

describe('CrowdsaleStartTime', () => {
  const TIMESTAMPS = {
    CURRENT_TIME: 1520852400000,
    PLUS_5_MINUTES: 1520852700000,
    PLUS_10_MINUTES: 1520853000000,
    PLUS_10_DAYS: 1521716400000,
    MINUS_5_MINUTES: 1520852100000,
    MINUS_10_DAYS: 1519988400000
  }
  const crowdsale = { tiers: [{ startTime: 0, endTime: 0 }] }
  beforeEach(() => {
    MockDate.set(TIMESTAMPS.CURRENT_TIME)
    crowdsale.tiers[0].startTime = TIMESTAMPS.PLUS_5_MINUTES
    crowdsale.tiers[0].endTime = TIMESTAMPS.PLUS_10_MINUTES
  })
  afterEach(() => {
    MockDate.reset()
    crowdsale.tiers[0].startTime = 0
    crowdsale.tiers[0].endTime = 0
  })

  describe('Rendering', () => {
    it(`should render CrowdsaleStartTime component`, () => {
      const wrapper = renderer.create(
        <Form
          onSubmit={jest.fn()}
          initialValues={crowdsale}
          render={() => (
            <CrowdsaleStartTime
              name="tiers[0].startTime"
              index="0"
              disabled={false}
              errorStyle={{ color: 'red', fontWeight: 'bold' }}
            />
          )}
        />
      )
      expect(wrapper).toMatchSnapshot()
    })

    it(`should render CrowdsaleStartTime component if field is disabled`, () => {
      const wrapper = renderer.create(
        <Form
          onSubmit={jest.fn()}
          initialValues={crowdsale}
          render={() => (
            <CrowdsaleStartTime
              name="tiers[0].startTime"
              index="0"
              disabled={true}
              errorStyle={{ color: 'red', fontWeight: 'bold' }}
            />
          )}
        />
      )
      expect(wrapper).toMatchSnapshot()
    })

    it(`should be  proper label and description`, () => {
      const wrapper = mount(
        <Form
          onSubmit={jest.fn()}
          initialValues={crowdsale}
          render={() => (
            <CrowdsaleStartTime
              name="tiers[0].startTime"
              index="0"
              disabled={false}
              errorStyle={{ color: 'red', fontWeight: 'bold' }}
            />
          )}
        />
      )
      const label = wrapper.find('label')
      expect(label.text()).toBe(LABEL)
      const description = wrapper.find('.sw-FormControlTitle_Tooltip')
      expect(description.text()).toBe(DECRIPTION)
    })
  })

  describe('Date validations', () => {
    let wrapper = undefined

    beforeEach(() => {
      wrapper = mount(
        <Form
          onSubmit={jest.fn()}
          initialValues={crowdsale}
          render={() => (
            <CrowdsaleStartTime
              name="tiers[0].startTime"
              index="0"
              disabled={false}
              errorStyle={{ color: 'red', fontWeight: 'bold' }}
            />
          )}
        />
      )
    })

    it(`shouldn't give errors if value is correct`, () => {
      const input = wrapper.find('input[name="tiers[0].startTime"]')
      input.simulate('change', { target: { value: TIMESTAMPS.PLUS_5_MINUTES } })
      const inputProps = wrapper.find('InputField2').props()
      expect(inputProps.meta.error).toBeUndefined()
    })
    it(`should fail if value is empty`, () => {
      const input = wrapper.find('input[name="tiers[0].startTime"]')
      input.simulate('change', { target: { value: '' } })
      const inputProps = wrapper.find('InputField2').props()
      expect(inputProps.meta.error[0]).toBe(VALIDATION_MESSAGES.REQUIRED)
    })
    it(`should fail if startTime is previous than current time`, () => {
      const input = wrapper.find('input[name="tiers[0].startTime"]')
      input.simulate('change', { target: { value: TIMESTAMPS.MINUS_5_MINUTES } })
      const inputProps = wrapper.find('InputField2').props()
      expect(inputProps.meta.error[0]).toBe(VALIDATION_MESSAGES.DATE_IN_FUTURE)
    })

    it(`should fail if startTime is later than endTime`, () => {
      const input = wrapper.find('input[name="tiers[0].startTime"]')
      input.simulate('change', { target: { value: TIMESTAMPS.PLUS_10_DAYS } })
      const inputProps = wrapper.find('InputField2').props()
      expect(inputProps.meta.error[0]).toBe("Should be previous than same tier's End Time")
    })
    it(`should fail if startTime is the same with endTime`, () => {
      const input = wrapper.find('input[name="tiers[0].startTime"]')
      input.simulate('change', { target: { value: TIMESTAMPS.PLUS_10_MINUTES } })
      const inputProps = wrapper.find('InputField2').props()
      expect(inputProps.meta.error[0]).toBe("Should be previous than same tier's End Time")
    })
  })
})
