import React from 'react';

import './Page404.scss';

const Page404: React.FC = () => {
  return (
    <section className="page-error">
      <div className="page-error__container">
        <div className="page-error__container__title">Page does not exist</div>
      </div>
    </section>
  );
};

export default Page404;
