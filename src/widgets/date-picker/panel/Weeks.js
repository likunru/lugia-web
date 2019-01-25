/*
 * by wangcuixia
 * @flow
 * */
import React, { Component } from 'react';
import Head from './Head';
import FacePanel from './FacePanel';
import { DateWrapper } from '../styled/styled';
import { getWeeksRange } from '../utils/differUtils';
import moment from 'moment';
type TypeProps = {
  step?: number,
  format?: string,
  onChangeYear?: Function,
  onChange?: Function,
  mode: string,
  model?: Object,
  from?: string,
  theme?: Object,
  year: number,
  weeks: number,
};
type TypeState = {
  year: number,
  secondTitle: string,
  isWeekInner: boolean,
  weeks: number,
  mode: string,
  moments: Object,
  format: string,
  from: string,
  step: number,
};
class Weeks extends Component<TypeProps, TypeState> {
  static displayName = 'Weeks';
  picker: any;
  from: string;
  constructor(props: TypeProps) {
    super(props);
    const { model } = props;
    model &&
      model.on('inputOnChange', (data: Object) => {
        const { year, weeks } = data;
        console.log(year);
        this.setState({
          year,
          weeks,
        });
      });
  }
  static getDerivedStateFromProps(nextProps: TypeProps, preState: TypeState) {
    const { year, weeks, from, step = 12 } = nextProps;
    console.log(year, weeks);
    const newYear = preState ? preState.year : year;
    const newWeeks = preState ? preState.weeks : weeks;
    const newFrom = preState ? preState.from : from;
    const isWeekInner = preState ? preState.isWeekInner : true;
    const weeksInYear = moment({ newYear }).weeksInYear();
    const { weeksDate, rangeIndex } = getWeeksRange(newWeeks, weeksInYear, step);
    const data = weeksDate[rangeIndex];
    const { text } = data;
    console.log(newYear);
    return {
      year: newYear,
      weeks: Number(newWeeks),
      from: newFrom,
      isWeekInner,
      secondTitle: text,
      step,
    };
  }
  arrorChange = (param: Object) => {
    const { year } = param;
    this.setState({ year });
  };
  onHeadChange = () => {
    this.setState({ isWeekInner: false });
  };
  headOnChange = (parma: Object) => {
    const { year } = parma;
    this.setState({ year });
    const { onChangeYear } = this.props;
    onChangeYear && onChangeYear({ mode: 'year', from: 'week' });
  };
  panelChange = (param: Object) => {
    const { isWeekInner, start, weeks, event } = param;
    const { year } = this.state;
    if (isWeekInner) {
      this.setState({ isWeekInner, weeks: start + 1 });
    }
    if (!isWeekInner) {
      const { from } = this;
      this.getOnChange({ year, weeks, mode: from, event });
    }
  };
  getOnChange = (data: Object) => {
    const { onChange } = this.props;
    onChange && onChange(data);
  };
  componentDidMount() {
    const { mode } = this.props;
    this.from = mode;
  }
  render() {
    const { year, secondTitle, isWeekInner, weeks, step } = this.state;
    const { theme } = this.props;
    console.log(year);
    return (
      <DateWrapper {...theme} mode={this.props.mode}>
        <div>
          <Head
            {...this.props}
            start={year}
            mode={'week'}
            isWeekInner={isWeekInner}
            secondTitle={secondTitle}
            onChange={this.arrorChange}
            onHeadChange={this.onHeadChange}
            headOnChange={this.headOnChange}
          />
          <FacePanel
            {...this.props}
            isWeekInner={isWeekInner}
            start={year}
            mode={'week'}
            weeks={weeks}
            step={step}
            onChange={this.panelChange}
          />
        </div>
      </DateWrapper>
    );
  }
}

export default Weeks;
