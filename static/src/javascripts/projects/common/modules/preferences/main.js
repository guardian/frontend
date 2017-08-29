import React from 'react/addons';
import $ from 'lib/$';
import config from 'lib/config';
import history from 'common/modules/onward/history';
import reduce from 'lodash/collections/reduce';
import isEmpty from 'lodash/objects/isEmpty';
export default {
    init() {
        const placeholder = document.getElementById('preferences-history-tags'),
              initialiseSummaryTagsSettings = () => {
                  const SummaryTagsList = React.createClass({
                      getInitialState() {
                          return {
                              popular: history.getPopularFiltered()
                          };
                      },
                      handleRemove(tag) {
                          history.deleteFromSummary(tag);
                          this.setState({
                              popular: history.getPopularFiltered({
                                  flush: true
                              })
                          });
                          history.showInMegaNav();
                      },
                      render() {
                          const self = this;

                          const tags = reduce(this.state.popular, (obj, tag) => {
                              obj[tag[0]] = React.DOM.span({
                                      className: 'button button--small button--tag button--secondary'
                                  },
                                  React.DOM.button({
                                      onClick: self.handleRemove.bind(self, tag[0]),
                                      'data-link-name': 'remove | ' + tag[1]
                                  }, 'X'),
                                  React.DOM.a({
                                      href: '/' + tag[0]
                                  }, tag[1])
                              );
                              return obj;
                          }, {});

                          let helperText;

                          if (isEmpty(tags)) {
                              helperText = '(You don\'t have any recently visited topics.)';
                          } else {
                              helperText = 'Remove individual topics by clicking \'X\' or switch off the functionality below. We respect your privacy and your shortcuts will never be made public.';
                          }
                          tags.helperText = React.DOM.p(null, helperText);
                          return React.DOM.div(null, tags);
                      }
                  });

                  const SummaryTagsSettings = React.createClass({
                      getInitialState() {
                          return {
                              enabled: history.showInMegaNavEnabled()
                          };
                      },
                      handleToggle() {
                          const isEnabled = !this.state.enabled;

                          this.setState({
                              enabled: isEnabled
                          });
                          history.showInMegaNavEnable(isEnabled);
                      },
                      render() {
                          const self = this, toggleAction = this.state.enabled ? 'OFF' : 'ON';

                          return React.DOM.div({
                              'data-link-name': 'suggested links'
                          }, [
                              React.DOM.p(null, 'These are based on the topics you visit most. You can access them at any time by opening the "all sections” menu.'),
                              this.state.enabled ? React.createElement(SummaryTagsList) : null,
                              React.DOM.button({
                                  onClick: self.handleToggle,
                                  className: 'button button--medium button--primary',
                                  'data-link-name': toggleAction
                              }, 'Switch recently visited links ' + toggleAction)
                          ]);
                      }
                  });

                  React.render(React.createElement(SummaryTagsSettings), placeholder);
              };

        if (placeholder) {
            initialiseSummaryTagsSettings();
        }
    }
};
