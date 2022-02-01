import React from 'react';

import Form from './Form';

import s from './style.module.scss';

const PageMain: React.FC = () => {
  return (
    <section className={s.page}>
      <div className={s.pageContainer}>
        <div className={s.containerTabs}>
          <div className={s.buttonTabActive}>Swap</div>
          <div className={s.buttonTab}>Pool</div>
        </div>

        <Form />
      </div>
    </section>
  );
};

export default PageMain;
