/* eslint-disable react/prop-types */
import { useEffect, useState, useMemo, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useIndexContext } from 'renderer/context/IndexContext';
import { SearchIcon } from 'renderer/icons';
import { AnimatePresence, motion } from 'framer-motion';
import Post from '../Posts/Post';
import InputBar from './InputBar';
import styles from './Search.module.scss';
import OptionsBar from './OptionsBar';

const filterResults = (results, options) => {
  const filtered = results.filter((result) => {
    const highlightCondition = options.onlyHighlighted
      ? result.highlight != null
      : true;
    const mediaCondition = options.hasAttachments
      ? result.attachments.length > 0
      : true;

    return highlightCondition && mediaCondition;
  });

  if (options.sortOrder === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (options.sortOrder === 'mostRecent') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return filtered;
};

export default function Search() {
  const { search, vectorSearch } = useIndexContext();
  const [container, setContainer] = useState(null);
  const [text, setText] = useState('');
  const [querying, setQuerying] = useState(false);
  const [response, setResponse] = useState([]);
  const [options, setOptions] = useState({
    dateRange: '',
    onlyHighlighted: false,
    notReplies: false,
    hasAttachments: false,
    sortOrder: 'relevance',
    semanticSearch: false,
  });

  const onChangeText = (event) => {
    setText(event.target.value);
  };

  const onSubmit = useCallback(async () => {
    if (text === '') {
      return;
    }

    setQuerying(true);

    try {
      const searchFn = options.semanticSearch ? vectorSearch : search;
      const result = await searchFn(text);
      setResponse(result);
    } finally {
      setQuerying(false);
    }
  }, [options.semanticSearch, search, text, vectorSearch]);

  useEffect(() => {
    onSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.semanticSearch]);

  const containerVariants = {
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  const filtered = useMemo(
    () => filterResults(response, options),
    [response, options],
  );

  const renderResponse = () => {
    return filtered.map((source) => {
      const uniqueKey = source.ref;

      if (!uniqueKey) {
        return null;
      }

      return (
        <motion.div
          variants={itemVariants}
          key={uniqueKey}
          className={styles.post}
        >
          <Post postPath={uniqueKey} searchTerm={text} />
        </motion.div>
      );
    });
  };

  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <div className={styles.iconHolder}>
            <SearchIcon className={styles.settingsIcon} />
          </div>
        </Dialog.Trigger>
        <Dialog.Portal container={container}>
          <Dialog.Overlay className={styles.DialogOverlay} />
          <Dialog.Content className={styles.DialogContent}>
            <div className={styles.wrapper}>
              <Dialog.Title className={styles.DialogTitle}>
                <InputBar
                  value={text}
                  onChange={onChangeText}
                  onSubmit={onSubmit}
                  querying={querying}
                />
                <OptionsBar options={options} setOptions={setOptions} />
              </Dialog.Title>
              <div className={styles.meta}>
                {filtered.length} thread{filtered.length !== 1 && 's'}
                <div className={styles.sep} />
                {filtered.reduce(
                  (count, item) => count + 1 + (item.replies?.length ?? 0),
                  0,
                )}{' '}
                entries
                <div className={styles.sep} />
                {filtered.filter((post) => post.highlight).length} highlighted
                <div className={styles.sep} />
                {filtered.reduce(
                  (count, item) => count + (item.attachments?.length ?? 0),
                  0,
                )}{' '}
                attachments
              </div>
              <AnimatePresence mode="wait">
                <motion.ul
                  initial="hidden"
                  animate="show"
                  variants={containerVariants}
                  className={styles.scroller}
                >
                  {renderResponse()}
                </motion.ul>
              </AnimatePresence>
            </div>
            <div className={styles.gradient} />
            <div className={styles.gradient2} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div ref={setContainer} />
    </>
  );
}
