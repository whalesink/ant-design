import classNames from 'classnames';
import { FormattedMessage, useRouteMeta } from 'dumi';
import type { ReactNode } from 'react';
import React, { Suspense, useContext, useLayoutEffect, useMemo } from 'react';
import { Col, Space, Typography, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import useLayoutState from '../../../hooks/useLayoutState';
import useLocation from '../../../hooks/useLocation';
import type { DemoContextProps } from '../DemoContext';
import DemoContext from '../DemoContext';
import SiteContext from '../SiteContext';

const Contributors = React.lazy(() => import('./Contributors'));
const ColumnCard = React.lazy(() => import('./ColumnCard'));
const DocAnchor = React.lazy(() => import('./DocAnchor'));
const DocMeta = React.lazy(() => import('./DocMeta'));
const Footer = React.lazy(() => import('../Footer'));
const PrevAndNext = React.lazy(() => import('../../common/PrevAndNext'));
const ComponentChangelog = React.lazy(() => import('../../common/ComponentChangelog'));
const EditButton = React.lazy(() => import('../../common/EditButton'));

const useStyle = createStyles(({ token, css }) => ({
  articleWrapper: css`
      padding: 0 170px 32px 64px;

      &.rtl {
        padding: 0 64px 144px 170px;
      }

      @media only screen and (max-width: ${token.screenLG}px) {
        &,
        &.rtl {
          padding: 0 48px;
        }
      }
    `,
}));

const Content: React.FC<{ children: ReactNode }> = ({ children }) => {
  const meta = useRouteMeta();
  const { pathname, hash } = useLocation();
  const { direction } = useContext(SiteContext);
  const { styles } = useStyle();

  const [showDebug, setShowDebug] = useLayoutState(false);
  const debugDemos = useMemo(
    () => meta.toc?.filter((item) => item._debug_demo).map((item) => item.id) || [],
    [meta],
  );

  const isDebugDemo = debugDemos.includes(hash.slice(1));

  useLayoutEffect(() => {
    setShowDebug(process.env.NODE_ENV === 'development' || isDebugDemo);
  }, []);

  const contextValue = useMemo<DemoContextProps>(
    () => ({ showDebug, setShowDebug }),
    [showDebug, debugDemos],
  );

  const isRTL = direction === 'rtl';

  return (
    <DemoContext.Provider value={contextValue}>
      <Col xxl={20} xl={19} lg={18} md={18} sm={24} xs={24}>
        <Suspense fallback={<Skeleton.Input active size="small" />}>
          <DocAnchor showDebug={showDebug} debugDemos={debugDemos} />
        </Suspense>
        <article className={classNames(styles.articleWrapper, { rtl: isRTL })}>
          {meta.frontmatter?.title ? (
            <Typography.Title style={{ fontSize: 30, position: 'relative' }}>
              <Space size="small">
                {meta.frontmatter?.title}
                {meta.frontmatter?.subtitle}

                {!pathname.startsWith('/components/overview') && (
                  <Suspense fallback={null}>
                    <EditButton
                      title={<FormattedMessage id="app.content.edit-page" />}
                      filename={meta.frontmatter.filename}
                    />
                  </Suspense>
                )}
              </Space>
              {pathname.startsWith('/components/') && (
                <Suspense fallback={null}>
                  <ComponentChangelog pathname={pathname} />
                </Suspense>
              )}
            </Typography.Title>
          ) : null}
          <Suspense fallback={<Skeleton.Input active size="small" />}>
            <DocMeta />
          </Suspense>
          {!meta.frontmatter.__autoDescription && meta.frontmatter.description}
          <div style={{ minHeight: 'calc(100vh - 64px)' }}>{children}</div>
          <Suspense fallback={<Skeleton.Input active size="small" />}>
            <ColumnCard
              zhihuLink={meta.frontmatter.zhihu_url}
              yuqueLink={meta.frontmatter.yuque_url}
              juejinLink={meta.frontmatter.juejin_url}
            />
          </Suspense>
          <Suspense fallback={<Skeleton.Input active size="small" />}>
            <Contributors filename={meta.frontmatter.filename} />
          </Suspense>
        </article>
        <Suspense fallback={<Skeleton.Input active size="small" />}>
          <PrevAndNext rtl={isRTL} />
        </Suspense>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </Col>
    </DemoContext.Provider>
  );
};

export default Content;
