/*
 *create by LYQ
 *
 *2018-12-03
 *
 *@flow
 *
 */
import React from 'react';
import styled from 'styled-components';
import GetElement from './getelement';
import request from './request';

const Container = styled.div`
  width: ${props => (props.theme.width ? props.theme.width : '366px')};
  position: relative;
  padding: 10px;
`;

type uploadProps = {
  disabled?: boolean,
  limit?: number,
  data?: Object,
  listType?: string,
  getTheme: Function,
  multiple?: boolean,
  fileList?: Array<Object>,
  showFileList?: boolean,
  withCredentials?: boolean,
  autoUpload?: boolean,
  accept?: string,
  url: string,
  headers?: Object,
  inputId?: string,
  size?: string,
  accessKey?: string,
  beforeUpload?: Function,
  onProgress?: Function,
  onSuccess?: Function,
  onComplete?: Function,
  onChange?: Function,
  onFail?: Function,
};
type stateProps = {
  defaultText?: string,
  classNameStatus?: string,
  fileListDone: Array<Object>,
  isAllowUpload: boolean,
  choosedFile?: Array<Object>,
  previewUrl?: string,
};

export const getIndexInArray = (data: Array<string>, key: string): number => {
  if (!key) return -1;
  return data.indexOf(key);
};

export const isKeyInArray = (data: Array<string>, key: string): boolean => {
  return getIndexInArray(data, key) !== -1;
};

export const isEmptyObject = (obj: Object): boolean => {
  if (!obj) return false;
  return Object.keys(obj).length === 0;
};

export const isIdInArray = (hashMark: string, array: Array<Object>) => {
  if (!array.length) return false;
  const res = array.some(function(item) {
    return item.hashMark === hashMark;
  });
  return res;
};

export const getPercentValue = (current: ?number, total: ?number): number => {
  if (!current || !total) return 0;
  return current / total < 0 ? 0 : current / total > 1 ? 100 : Math.floor((current / total) * 100);
};

export const getHashMark = (): string => {
  return 'r' + new Date().getTime();
};

const loop = () => true;
// const p = (): Promise<Object> => {
//   return new Promise(res => {
//       res({status:true});
//   });
// };

class Upload extends React.Component<uploadProps, stateProps> {
  input: Object;
  static defaultProps = {
    disabled: false,
    listType: 'default',
    multiple: false,
    showFileList: false,
    limit: 5,
    withCredentials: false,
    autoUpload: true,
    onProgress: loop,
    onSuccess: loop,
    onComplete: loop,
    onFail: loop,
    onChange: loop,
    getTheme: () => {
      return {};
    },
  };

  static getDerivedStateFromProps(defProps: uploadProps, stateProps: stateProps) {
    if (!stateProps) {
      return {
        classNameStatus: 'default',
        defaultText: '请将文件拖到此处',
        fileListDone: defProps.fileList || [],
        isAllowUpload: defProps.autoUpload,
      };
    }
    const { classNameStatus, defaultText, fileListDone, isAllowUpload } = stateProps;
    return {
      classNameStatus: 'classNameStatus' in stateProps ? classNameStatus : 'default',
      defaultText: 'defaultText' in stateProps ? defaultText : '请将文件拖到此处',
      fileListDone: 'fileListDone' in stateProps ? fileListDone : defProps.fileList,
      isAllowUpload: 'isAllowUpload' in stateProps ? isAllowUpload : defProps.autoUpload,
    };
  }
  render() {
    return (
      <Container>
        <GetElement
          {...this.props}
          {...this.state}
          setChoosedFile={this.setChoosedFile}
          setAutoUploadState={this.setAutoUploadState}
          setDeleteList={this.setDeleteList}
        />
      </Container>
    );
  }
  setChoosedFile = (res: Array<Object>): void => {
    this.setStateValue(
      {
        choosedFile: res,
      },
      () => {
        this.uploadFiles();
      }
    );
    const { onChange } = this.props;
    onChange && onChange(res);
  };

  uploadFiles = () => {
    const { url, withCredentials, data, headers } = this.props;
    const dataObject = { url, withCredentials, data, headers };
    this.beforeUpload(dataObject);
  };

  getChangeUploadState = (typeState: string, i: number, hashMark: string) => {
    const { choosedFile = [], fileListDone } = this.state;
    let list;
    if (isIdInArray(hashMark, fileListDone)) {
      list = this.getFileList(fileListDone, hashMark, [{ target: 'status', value: 'loading' }]);
    } else {
      const { listType } = this.props;
      list = this.appendFileList(fileListDone, {
        hashMark,
        name: choosedFile[i].name,
        listType,
        status: typeState,
        percent: 0,
      });
    }
    return {
      classNameStatus: typeState,
      fileListDone: list,
      defaultText: choosedFile[i].name,
    };
  };

  beforeUpload = (dataObject: Object) => {
    const { choosedFile = [] } = this.state;
    const { i = 0 } = dataObject;

    const { beforeUpload } = this.props;
    if (!beforeUpload) {
      this.addRequest(dataObject);
    } else {
      beforeUpload(choosedFile[i]).then(message => {
        if (message.status) {
          const { accessKey } = this.props;
          const { file } = message;
          if (accessKey) {
            dataObject.data[accessKey] = file[accessKey];
            delete file[accessKey];
            console.log(file, dataObject);
          }
          this.addRequest(dataObject, file);
        }
      });
    }
  };

  addRequest = (dataObject: Object, file?: Object): void => {
    const { fileListDone } = this.state;
    let { i = 0 } = dataObject;
    // let hashMark = fileListDone.length + 1 + i;
    let hashMark = getHashMark();
    const { isAllowUpload } = this.state;
    const { autoUpload } = this.props;
    let list;
    if (!autoUpload && isAllowUpload) {
      console.log(i, fileListDone);
      hashMark = fileListDone[i].hashMark;
      list = this.getChangeUploadState('loading', i, hashMark);
      console.log('list', list, file);
      this.setStateValue({ ...list });
    } else {
      list = this.getChangeUploadState('default', i, hashMark);
      this.setStateValue({ ...list });
      if (!isAllowUpload) return;
    }

    const { choosedFile = [] } = this.state;
    const { url, withCredentials, data, headers } = dataObject;
    request({
      url,
      withCredentials,
      method: 'post',
      dataType: 'json',
      data,
      file: file || choosedFile[i],
      headers,
      onSuccess: res => {
        this.uploadSuccess(res, hashMark);
      },
      onFail: res => {
        this.uploadFail(res, hashMark);
      },
      onProgress: res => {
        this.uploadProgress(res, hashMark);
      },
      onComplete: res => {
        i++;
        if (i >= choosedFile.length) {
          this.uploadComplete(res, hashMark);
        } else {
          const { limit } = this.props;
          if (limit && i > limit - 1) return;
          dataObject.i = i;
          this.beforeUpload(dataObject);
          this.uploadComplete(res, hashMark);
        }
      },
    });
  };

  uploadSuccess = (res: Object, hashMark: string): void => {
    const { fileListDone } = this.state;
    const list = this.getFileList(fileListDone, hashMark, [
      { target: 'status', value: 'done' },
      { target: 'url', value: res.data.url },
    ]);
    this.setStateValue({ classNameStatus: 'done', fileListDone: list });
    const { listType } = this.props;
    const { choosedFile = [] } = this.state;
    if (listType === 'picture') {
      this.loadPreviewInfo(choosedFile[0]);
    }
    const { onSuccess } = this.props;
    onSuccess && onSuccess(res);
  };

  uploadComplete = (res: Object, hashMark: string): void => {
    const { onComplete } = this.props;
    onComplete && onComplete(res.currentTarget.response);
  };

  uploadProgress = (res: Object, hashMark: string): void => {
    const { loaded, total } = res;
    const percent = getPercentValue(loaded, total);
    const { fileListDone } = this.state;
    const list = this.getFileList(fileListDone, hashMark, [
      { target: 'percent', value: percent },
      { target: 'status', value: 'loading' },
    ]);
    this.setStateValue({ classNameStatus: 'loading', fileListDone: list });
    const { onProgress } = this.props;
    onProgress && onProgress({ loaded, total });
  };

  uploadFail = (res: Object, hashMark: string): void => {
    const { fileListDone } = this.state;
    const list = this.getFileList(fileListDone, hashMark, [{ target: 'status', value: 'fail' }]);
    this.setStateValue({ classNameStatus: 'fail', fileListDone: list });
    const { onFail } = this.props;
    onFail && onFail(res);
  };

  getFileList = (
    fileListDone: Array<Object>,
    props: string,
    data: Array<Object> = []
  ): Array<Object> => {
    fileListDone.forEach(i => {
      if (i.hashMark === props) {
        data.forEach(j => {
          i[j.target] = j.value;
        });
      }
    });
    return fileListDone;
  };
  appendFileList = (fileListDone: Array<Object>, props: Object): Array<Object> => {
    if (!isEmptyObject(props)) {
      fileListDone.push(props);
    }
    return fileListDone;
  };

  loadPreviewInfo = (file: any): void => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.setStateValue({ previewUrl: reader.result });
      reader.onloadend = null;
    };
  };

  setDeleteList = (index: number) => {
    const { fileListDone } = this.state;
    fileListDone.splice(index, 1);
    this.setStateValue({ fileListDone });
  };

  setAutoUploadState = (value: boolean) => {
    const { choosedFile } = this.state;
    if (!choosedFile) return;
    this.setStateValue({ isAllowUpload: value }, this.uploadFiles);
  };

  setStateValue = (props: Object, cbk?: Function) => {
    this.setState(
      {
        ...props,
      },
      () => {
        cbk && cbk();
      }
    );
  };
}

export default Upload;
