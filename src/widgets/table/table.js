/**
 *
 * create by guorg
 *
 * @flow
 *
 */
import * as React from 'react';
import CSSComponent from '@lugia/theme-css-hoc';
import ThemeProvider from '../theme-provider';
import Widget from '../consts/index';
import RcTable, { INTERNAL_COL_DEFINE } from 'rc-table';
import Checkbox from '../checkbox';
import 'rc-table/assets/index.css';
import './style/lugia-table.css';
import type { TableProps, TableState } from '../css/table';
import { css } from 'styled-components';

const TableWrap = CSSComponent({
  tag: 'div',
  className: 'TableWrap',
  css: css`
    overflow: auto;
  `,
  normal: {
    selectNames: [['width'], ['height']],
    getCSS(themeMeta): string {
      const { background: { color } = {} } = themeMeta;
      if (color) {
        return css`
          tbody .rc-table-cell {
            background: red;
          }
        `;
      }
      return '';
    },
  },
});

export default ThemeProvider(
  class extends React.Component<TableProps, TableState> {
    selectedRecords: Object[];
    validRecords: Object[];
    disabledSelectedRecords: Object[];
    validKeys: any[];
    disabledSelectedKeys: any[];
    constructor(props) {
      super();
      const { data = [], selectOptions: { selectRowKeys = [] } = {} } = props;

      const dataLength = data.length;
      const selectRowKeyLength = selectRowKeys.length;
      this.state = {
        headChecked: dataLength === selectRowKeyLength && dataLength > 0,
        headIndeterminate: !!selectRowKeyLength,
        selectRowKeys: selectRowKeys || [],
      };
    }

    static getDerivedStateFromProps(props) {
      const { data, selectOptions = {} } = props;
      if ('selectRowKeys' in selectOptions) {
        const {
          selectRowKeys = [],
          setCheckboxProps = (record: Object) => {
            return {};
          },
        } = selectOptions;
        let allValidSelected = data && data.length > 0;
        const validSelectRowKeys = [];
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          const itemKey = item.key;
          const checkboxProps = setCheckboxProps(item) || {};
          if (!checkboxProps.disabled) {
            const selectc = selectRowKeys.includes(itemKey);
            if (selectc) {
              validSelectRowKeys.push(itemKey);
            } else {
              allValidSelected = false;
            }
          }
        }
        return {
          headChecked: allValidSelected,
          headIndeterminate: !!validSelectRowKeys.length,
          selectRowKeys,
        };
      }

      return null;
    }

    tableItemChange = (key, record) => () => {
      const { selectOptions = {} } = this.props;
      const { selectRowKeys } = this.state;
      const unSelect = selectRowKeys.includes(key);
      const newSelectRowKeys = unSelect
        ? this.filterKey(selectRowKeys, item => item !== key)
        : [...selectRowKeys, key];
      const newRecords = unSelect
        ? this.filterKey(this.selectedRecords, item => item.key !== key)
        : [...this.selectedRecords, record];
      const { onChange } = selectOptions;
      onChange && onChange(newSelectRowKeys, newRecords);
      if ('selectRowKeys' in selectOptions) {
        return;
      }
      const allIn = this.filterKey(this.validKeys, item => !newSelectRowKeys.includes(item));
      this.setState({
        selectRowKeys: newSelectRowKeys,
        headIndeterminate: !!newSelectRowKeys.length,
        headChecked: !allIn.length,
      });
    };

    filterKey(target: string[] | Object[], filter: any => boolean) {
      return target.filter(item => filter(item));
    }

    tableHeadChange = () => {
      const { selectOptions = {} } = this.props;
      const { headChecked } = this.state;
      const { onChange } = selectOptions;
      const selectedKeys = headChecked
        ? this.disabledSelectedKeys || []
        : [...this.validKeys, ...this.disabledSelectedKeys];
      const selectedRecords = headChecked
        ? this.disabledSelectedRecords || []
        : [...this.validRecords, ...this.disabledSelectedRecords];

      onChange && onChange(selectedKeys, selectedRecords);

      if ('selectRowKeys' in selectOptions) return;

      this.setState({
        selectRowKeys: selectedKeys,
        headIndeterminate: !headChecked,
        headChecked: !headChecked,
      });
    };

    render() {
      const {
        children,
        columns = [],
        data,
        showHeader = true,
        tableStyle = 'bordered',
        getPartOfThemeProps,
        selectOptions = {},
      } = this.props;
      this.selectedRecords = [];
      this.validKeys = [];
      this.disabledSelectedKeys = [];
      this.validRecords = [];
      this.disabledSelectedRecords = [];
      const { headChecked, headIndeterminate, selectRowKeys: stateSelectRowKeys } = this.state;
      const containerTheme = getPartOfThemeProps('Container');
      if (children) {
        return (
          <TableWrap themeProps={containerTheme} className={this.getClass(tableStyle)}>
            <RcTable
              {...this.props}
              data={data}
              showHeader={showHeader}
              rowClassName={(record, i) => `row-${i}`}
              className="table"
            >
              {children}
            </RcTable>
          </TableWrap>
        );
      }
      const theColumns = [...columns];
      if ('selectOptions' in this.props) {
        const {
          setCheckboxProps = (record: Object) => {
            return {};
          },
          width = 60,
        } = selectOptions;
        const selectColumnItem = {
          title: (
            <Checkbox
              checked={headChecked}
              indeterminate={headIndeterminate}
              onChange={this.tableHeadChange}
            />
          ),
          className: 'lugia-select-column',
          key: 'selection-column',
          width,
          render: (text, record) => {
            const rowKey = record.key;
            const select = stateSelectRowKeys.includes(rowKey);
            const checkboxProps = setCheckboxProps(record) || {};

            if (select) {
              this.selectedRecords.push(record);
              if (checkboxProps.disabled) {
                this.disabledSelectedKeys.push(rowKey);
                this.disabledSelectedRecords.push(record);
              }
            }
            if (!checkboxProps.disabled) {
              this.validKeys.push(rowKey);
              this.validRecords.push(record);
            }

            return (
              <Checkbox
                checked={select}
                onChange={this.tableItemChange(rowKey, record)}
                {...checkboxProps}
              />
            );
          },
          [INTERNAL_COL_DEFINE]: {
            className: 'lugia-selection-col',
          },
        };
        theColumns.unshift(selectColumnItem);
      }
      let expandIconColumnIndex =
        theColumns && theColumns[0] && theColumns[0].key === 'selection-column' ? 1 : 0;
      if ('expandIconColumnIndex' in this.props) {
        const { expandIconColumnIndex: propsIndex } = this.props;
        expandIconColumnIndex = Number(propsIndex);
      }
      return (
        <TableWrap themeProps={containerTheme} className={this.getClass(tableStyle)}>
          <RcTable
            {...this.props}
            columns={theColumns}
            data={data}
            showHeader={showHeader}
            expandIconColumnIndex={expandIconColumnIndex}
          />
        </TableWrap>
      );
    }
    getClass = (tableStyle: 'zebraStripe' | 'linear' | 'bordered'): string => {
      return `lugia-table lugia-table-${tableStyle}`;
    };
  },
  Widget.Table
);
